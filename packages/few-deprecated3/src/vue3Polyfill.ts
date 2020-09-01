import type {
    App,
    CreateAppFunction
} from '@/types';

import {
    h as createElement,
    Fragment,
    createApp as createVueApp
} from 'vue';

import { setH } from './vDom';

const h = {
    type: 'vue',
    createElement,
    Fragment
};

/**
 * Create app for specific component def
 * @param componentDef component definition
 * @returns web app object
 */
export const createApp: CreateAppFunction = componentDef => {
    setH( h );
    const vueApp = createVueApp( componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( vueApp.mount( elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( vueApp.unmount( elem ), app ) )
    };
    return app;
};

export default h;
