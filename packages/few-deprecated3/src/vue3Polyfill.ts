import type {
    App,
    VDom,
    CreateAppFunction
} from '@/types';

import type {
    VNodeArrayChildren
} from 'vue';

import {
    Fragment,
    h as createElement,
    createApp as createVueApp
} from 'vue';

import { setH } from '@/vDom';

import { isComponent } from '@/utils';

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
    createComponent: component => {
        component.render.displayName = component.name;
        return component.render;
    }
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
