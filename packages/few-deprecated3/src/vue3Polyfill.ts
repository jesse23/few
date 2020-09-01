import type {
    App,
    CreateAppFunction
} from '@/types';

import {
    h as createElement,
    Fragment,
    createApp as createVueApp
} from 'vue';

/**
 * Create app for specific component def
 * @param componentDef component definition
 * @returns web app object
 */
export const createApp: CreateAppFunction = componentDef => {
    const vueApp = createVueApp( componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( vueApp.mount( elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( vueApp.unmount( elem ), app ) )
    };
    return app;
};

export default {
    type: 'vue',
    createElement,
    createApp,
    Fragment
};

