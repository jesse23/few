/* eslint-env es6 */

import type { App } from '@/types';
import * as route from './route';
import { h } from './vDom';

const entryElem = document.getElementById( 'main-entrypoint' );

// Polyfill
import { createApp as createReactApp } from './reactPolyfill';
import { createApp as createVueApp } from './vue3Polyfill';

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
        app = createReactApp( () => h( FunctionComponent, { name: 'react' } ) ).mount( entryElem );
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
        app = createVueApp( () => h( FunctionComponent, { name: 'vue3' } ) ).mount( entryElem );
    },
    leave: () => {
        app.unmount( entryElem );
    }
} );
