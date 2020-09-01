/* eslint-env es6 */

import * as route from './route';
import { setH, h } from './vDom';

const entryElem = document.getElementById( 'main-entrypoint' );

// React
import ReactDOM from 'react-dom';

// Vue
import { createApp as createVueApp } from 'vue';

// Polyfill
import React from './reactPolyfill';
import Vue3 from './vue3Polyfill';

import {
    FunctionComponent,
    ObjectComponent,
    ObjectComponent2
} from './ComponentExample';


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

// react
route.register( {
    id: 'react',
    path: '/react',
    parent: undefined,
    enter: () => {
        setH( React );
        ReactDOM.render( h( ObjectComponent2.render, { name: 'React' } ), entryElem );
    },
    leave: () => {
        ReactDOM.unmountComponentAtNode( entryElem );
    }
} );

// vue
let app = null;
route.register( {
    id: 'vue',
    path: '/vue3',
    parent: undefined,
    enter: () => {
        setH( Vue3 );
        app = createVueApp( ObjectComponent2.render, { name: 'Vue3' } );
        app.mount( entryElem );
    },
    leave: () => {
        app.unmount( entryElem );
    }
} );
