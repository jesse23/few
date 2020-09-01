/* eslint-env es6 */

import type { App } from '@/types';
import * as route from './route';
import { setH, h } from './vDom';

const entryElem = document.getElementById( 'main-entrypoint' );

// Polyfill
import React from './reactPolyfill';
import Vue3 from './vue3Polyfill';

import {
    FunctionComponent
} from '../test/components/FunctionExample';


// about
route.register( {
    id: 'about',
    path: '/about',
    parent: undefined,
    data: {
        testUrl: 'aboutData'
    },
    params: {
        param1: 'aa'
    },
    enter: () => {
        // eslint-disable-next-line no-console
        console.log( 'about: enter' );
        entryElem.innerHTML = 'Click any link above...';
    },
    leave: () => {
        // eslint-disable-next-line no-console
        console.log( 'about: leaving' );
        entryElem.innerHTML = '';
    }
} );

let app = null as App;

// react
route.register( {
    id: 'react',
    path: '/react',
    parent: undefined,
    enter: () => {
        setH( React );
        app = React.createApp( () => h( FunctionComponent, { name: 'react' } ) ).mount( entryElem );
    },
    leave: () => {
        app.unmount( entryElem );
    }
} );

// vue
route.register( {
    id: 'vue',
    path: '/vue3',
    parent: undefined,
    enter: () => {
        setH( Vue3 );
        app = Vue3.createApp( () => h( FunctionComponent, { name: 'vue3' } ) ).mount( entryElem );
    },
    leave: () => {
        app.unmount( entryElem );
    }
} );
