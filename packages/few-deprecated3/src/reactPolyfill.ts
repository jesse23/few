// React
import type {
    App,
    CreateAppFunction
} from '@/types';

import { setH } from '@/vDom';

import {
    createElement,
    Fragment
} from 'react';
import ReactDOM from 'react-dom';

const h = {
    type: 'react',
    createElement,
    Fragment
};

export const createApp: CreateAppFunction = componentDef => {
    setH( h );
    const component = createElement( componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( ReactDOM.render( component, elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( ReactDOM.unmountComponentAtNode( elem ), app ) )
    };
    return app;
};

export default h;
