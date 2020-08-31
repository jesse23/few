/* eslint-env es6 */

import * as route from './route';

const entryElem = document.getElementById( 'main-entrypoint' );

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
        entryElem.innerHTML = 'React APP';
    },
    leave: () => {
        entryElem.innerHTML = '';
    }
} );

// vue
route.register( {
    id: 'vue',
    path: '/vue',
    parent: undefined,
    enter: () => {
        entryElem.innerHTML = 'Vue APP';
    },
    leave: () => {
        entryElem.innerHTML = '';
    }
} );
