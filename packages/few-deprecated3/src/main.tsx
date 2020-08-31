/* eslint-env es6 */

import * as route from './route';

const entryElem = document.getElementById( 'main-entrypoint' );

// React
import React from 'react';
import ReactDOM from 'react-dom';

// Vue
import {
    createApp as createVueApp,
    h as createVueElement,
    Fragment as VueFragment
} from 'vue';


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
        const h: any = React.createElement;
        h.createElement = React.createElement;
        h.Fragment = React.Fragment;

        ReactDOM.render( h( () => <div>Hello React</div> ), entryElem );
    },
    leave: () => {
        ReactDOM.unmountComponentAtNode( entryElem );
    }
} );

// vue
let app = null;
route.register( {
    id: 'vue',
    path: '/vue',
    parent: undefined,
    enter: () => {
        const h: any = createVueElement;
        h.createElement = createVueElement;
        h.Fragment = VueFragment;

        app = createVueApp( () => <div>Hello Vue</div> );
        app.mount( entryElem );
    },
    leave: () => {
        app.unmount( entryElem );
    }
} );
