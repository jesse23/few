// React
import {
    Fragment,
    createElement
} from 'react';
import ReactDOM from 'react-dom';


import type {
    App,
    Component,
    Props,
    CreateAppFunction
} from '@/types';

import { setH } from '@/vDom';

import { isComponent } from '@/utils';

const h = {
    type: 'react',
    Fragment,
    createElement: ( type: string | Component<Props>, props?: Props | null, ...children: React.ReactNode[] ): JSX.Element => {
        if ( !type ) {
            return createElement( Fragment, props, ...children );
        } else if ( isComponent( type ) ) {
            if ( !type._compiled || !type._compiled.react ) {
                type._compiled = {
                    ...type._compiled,
                    react: h.createComponent( type )
                };
            }
            return createElement( type._compiled.react, props, ...children );
        }
        return createElement( type, props, ...children );
    },
    createComponent: ( component: Component<Props> ): { ( props: Props ): JSX.Element } => {
        return component.render;
    }
};

export const createApp: CreateAppFunction = componentDef => {
    setH( h );
    const component = h.createElement( componentDef );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( ReactDOM.render( component, elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( ReactDOM.unmountComponentAtNode( elem ), app ) )
    };
    return app;
};

export default h;
