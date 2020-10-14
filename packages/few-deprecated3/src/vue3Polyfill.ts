import type {
    App,
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
    createElement: ( type, props?, ...children ) => {
        // align on input behavior with react
        if ( type === 'input' && props.onChange ) {
            props.onInput = props.onChange;
            delete props.onChange;
        }

        // [Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance.
        // set children to null if children === []
        let childrenN = ( children.length > 0 ? children : null ) as VNodeArrayChildren;

        if ( isComponent( type ) ) {
            if ( !type._compiled || !type._compiled.vue ) {
                type._compiled = {
                    ...type._compiled,
                    vue: h.createComponent( type )
                };
            }
            childrenN = childrenN && childrenN.length === 1 ? childrenN[0] as VNodeArrayChildren : childrenN;
            return createElement( type._compiled.vue, {
                ...props,
                childrenN
            } );
        } else if ( !type ) {
            return createElement( Fragment, props, childrenN );
        }
        return createElement( type, props, childrenN );
    },
    createComponent: component => defineComponent( {
        name: 'Hi',
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
            const model = isStatefulComponent( component ) ? component.init( context.attrs ) : {};

            const vm = {
                model: reactive( isPromise( model ) ? {} : model ),
                actions: {}
                /*
                ref: ( ( path?: string ) => ( el: HTMLElement ): void => {
                    component.ref[path || 'el'] = el;
                } ) as Ref,
                */
            };

            const dispatch = ( { path, value }: DispatchInput ): void => {
                lodashSet( vm.model, path, value );
            };

            const actions = isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => {
                sum[key] = ( ...args: any[] ): void => fn( vm.model, ...args );
                return sum;
            }, {} as Props ) : {};

            vm.model.dispatch = dispatch;

            onMounted( () => {
                if ( isPromise( model ) ) {
                    Promise.resolve( model ).then( model => {
                        Object.assign( vm.model, model );
                    } ).then( () => {
                        // componentDef.mount && componentDef.mount( component );
                    } );
                } else {
                    // componentDef.mount && componentDef.mount( component );
                }

                // for onmount/init
                // updateWatchers( component );
            } );

            onBeforeUnmount( () => component.unmount && component.unmount( vm.model ) );

            return (): JSX.Element => {
                // update props
                Object.assign( vm.model, actions );
                Object.assign( vm.model, context.attrs );

                // component.children = context.slots.default && context.slots.default();
                // component.children = context.attrs.children;
                return component.view( vm.model );
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
