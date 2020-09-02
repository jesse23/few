import type {
    App,
    Props,
    Component,
    CreateAppFunction
} from '@/types';

import type {
    VNodeArrayChildren,
    VNode
} from 'vue';

import {
    Fragment,
    h as createElement,
    createApp as createVueApp
} from 'vue';

import { setH } from '@/vDom';

import { isComponent } from '@/utils';

const h = {
    type: 'vue',
    Fragment,
    createElement: ( type: string | Component<Props>, props?: Props | null, ...children: VNodeArrayChildren ): VNode => {
        // align on input behavior with react
        if ( type === 'input' && props.onChange ) {
            props.onInput = props.onChange;
            delete props.onChange;
        }

        // [Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance.
        // set children to null if children === []
        children = children.length > 0 ? children : null;

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
                children
            } );
        } else if ( !type ) {
            return createElement( Fragment, props, children );
        }
        return createElement( type, props, children );
    },
    createComponent: ( component: Component<Props> ): { ( props: Props ): JSX.Element } => {
        return component.render;
    }
};

/**
 * Create app for specific component def
 * @param componentDef component definition
 * @returns web app object
 */
export const createApp: CreateAppFunction = componentDef => {
    setH( h );
    const vueApp = createVueApp( isComponent( componentDef ) ? h.createComponent( componentDef ) : componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( vueApp.mount( elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( vueApp.unmount( elem ), app ) )
    };
    return app;
};

export default h;
