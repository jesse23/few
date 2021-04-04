import type {
    App,
    Ref,
    VDom,
    Props,
    Watcher,
    DispatchInput,
    RenderFunction,
    CreateAppFunction
} from '@/types';

import type {
    Component as VueComponent,
    VNodeArrayChildren,
    SetupContext
} from 'vue';

import {
    Fragment,
    reactive,
    watch,
    onMounted,
    onBeforeUnmount,
    onUpdated,
    h as createElement,
    createApp as createVueApp
} from 'vue';

import lodashSet from 'lodash/set';

import { setH, AsyncH } from '@/vDom';

import {
    isComponent,
    isStatefulComponent,
    isPromise
} from '@/utils';

// VueComponent wrapper
const defineComponent: { ( componentDef: VueComponent ): RenderFunction<Props> } = ( componentDef: never ) => componentDef;

const h: VDom = {
    type: 'vue',
    Fragment,
    await: ( fn: Function ): JSX.Element => h.createElement( AsyncH, { fn } ),
    createElement: ( type, props?, ...childArr ) => {
        // align on input behavior with react
        if ( type === 'input' && props.onChange ) {
            props.onInput = props.onChange;
            delete props.onChange;
        }

        // className
        if ( props && props.className ) {
            props.class = props.className;
            delete props.className;
        }

        // [Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance.
        // set children to null if children === []
        let children = ( childArr.length > 0 ? childArr : null ) as VNodeArrayChildren;

        if ( isComponent( type ) ) {
            if ( !type._compiled || !type._compiled.vue ) {
                type._compiled = {
                    ...type._compiled,
                    vue: h.createComponent( type )
                };
            }
            children = children && children.length === 1 ? children[0] as VNodeArrayChildren : children;
            return createElement( type._compiled.vue, {
                ...props,
                // TODO: not sure what will happen before children example is done
                children
            } );
        } else if ( !type ) {
            return createElement( Fragment, props, children );
        }
        return createElement( type, props, children );
    },
    createComponent: component => defineComponent( {
        name: component.name,
        inheritAttrs: false,
        // in Vue render is denied as loose as 'Function'
        // in typeScript by default JSX returns JSX.Element
        // so here even for Vue we use JSX.Element
        /*
        render: ( component: Component & Vue.ComponentOptions ): JSX.Element => {
            return componentDef.view( polyfill.createElement )( component );
        },
        */
        /*
        when u declare 'props', then it can be accessed as input of setup function. Otherwise it is attrs
        props: {
            firstName: String
        },
        */
        setup: ( _: never, context: SetupContext ): RenderFunction<Props> => {
            let initRes = isStatefulComponent( component ) ? component.init( context.attrs ) : {};

            const model = reactive( isPromise( initRes ) ? {} : initRes );

            const dispatch = ( { path, value }: DispatchInput ): void => void
                lodashSet( model, path, value );

            const ref = ( ( path?: string ) => ( el: HTMLElement ): void => {
                ref[path || 'el'] = el;
            } ) as Ref;

            const actions = {} as Props;

            const getState = (): Props => ( {
                ...model,
                dispatch,
                ref,
                ...actions,
                ...context.attrs
            } );

            Object.assign( actions, isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => {
                sum[key] = ( ...args: any[] ): void => fn( getState(), ...args );
                return sum;
            }, {} as Props ) : {} );


            const watching = {
                current: [] as Watcher[]
            };

            const updateWatchers = (): void => {
                if ( isStatefulComponent( component ) && component.watchers ) {
                    const watcherRes = component.watchers( getState() );
                    const lastRes = watching.current;
                    watching.current = watcherRes;
                    watcherRes.forEach( ( curr, idx ) => {
                        const isDefined = lastRes.length > 0;
                        const last = lastRes.length > idx ? lastRes[idx] : undefined;
                        if ( !isDefined || last.watch !== curr.watch ) {
                            curr.action();
                        }
                    } );
                }
            };


            /*
            const vm = {
                ref: ( ( path?: string ) => ( el: HTMLElement ): void => {
                    component.ref[path || 'el'] = el;
                } ) as Ref,
            } as Props;
            */

            onMounted( () => {
                if ( isPromise( initRes ) ) {
                    Promise.resolve( initRes ).then( m => {
                        Object.assign( model, m );
                        initRes = null;
                    } ).then( () => {
                        component.mount && component.mount( getState() );
                    } );
                } else {
                    component.mount && component.mount( getState() );
                }

                // for onmount/init
                updateWatchers();
            } );

            onBeforeUnmount( () => component.unmount && component.unmount( getState() ) );

            // for model change to trigger digest or parent attr direct change
            onUpdated( updateWatchers );

            // for model change not trigger digest or change inside parent attr
            watch( () => {
                /*
                if( component.props.prop && component.props.prop.color ) {
                    return component.props.prop.color;
                }
                */
                return isStatefulComponent( component ) && component.watchers && component.watchers( getState() );
            }, ( /*oldVal, newVal*/ ) => {
                updateWatchers();
                // console.log( `${oldVal} => ${newVal}` );
            } );

            return (): JSX.Element => {
                // component.children = context.slots.default && context.slots.default();
                // component.children = context.attrs.children;
                return component.view( getState() );
            };
        }
    } )
};

/**
 * Create app for specific component def
 * @param component component definition
 * @returns web app object
 */
export const createApp: CreateAppFunction = component => {
    setH( h );
    const vueApp = createVueApp( isComponent( component ) ? h.createComponent( component ) : component );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( vueApp.mount( elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( vueApp.unmount( elem ), app ) )
    };
    return app;
};

export default h;
