// React
import type {
    App,
    CreateAppFunction
} from '@/types';

import {
    createElement,
    Fragment
} from 'react';
import ReactDOM from 'react-dom';

export const createApp: CreateAppFunction = componentDef => {
    const component = createElement( componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( ReactDOM.render( component, elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( ReactDOM.unmountComponentAtNode( elem ), app ) )
    };
    return app;
};

export default {
    type: 'react',
    createElement,
    createApp,
    Fragment
};
