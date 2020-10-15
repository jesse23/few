import type {
    App,
    Ref,
    VDom,
    Props,
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
    onMounted,
    onBeforeUnmount,
    h as createElement,
    createApp as createVueApp
} from 'vue';

import lodashSet from 'lodash/set';

import { setH } from '@/vDom';

import {
    isComponent,
    isStatefulComponent,
    isPromise
} from '@/utils';

// VueComponent wrapper
export const defineComponent: { ( componentDef: VueComponent ): RenderFunction<Props> } = ( componentDef: never ) => componentDef;

const h: VDom = {
    type: 'vue',
    Fragment,
    createElement: ( type, props?, ...childArr ) => {
        // align on input behavior with react
        if ( type === 'input' && props.onChange ) {
            props.onInput = props.onChange;
            delete props.onChange;
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
                // updateWatchers( component );
            } );

            onBeforeUnmount( () => component.unmount && component.unmount( getState() ) );

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
