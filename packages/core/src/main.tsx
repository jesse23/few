/* eslint-env es6 */

import type { App, CreateAppFunction } from '@/types';
import * as route from './route';
import { h } from './vDom';
// import Example from '@/examples/XComponentExample';
import Example from '@/components/MarkdownView';
import { GlobalFrame } from '@/site/GlobalFrame';

// Polyfill
import { createApp as createReactApp } from '@/reactPolyfill';
import { createApp as createVueApp } from '@/vue3Polyfill';

const entryElem = document.getElementById( 'entry-point' );

const createApps = {
    react: createReactApp,
    vue3: createVueApp
};

// set current base
const baseElem = document.createElement( 'base' );
baseElem.setAttribute( 'href', route.getBaseURL() );
document.head.appendChild( baseElem );

const load = Object.assign( () => {
    if( load.app ) {
        load.app.unmount( entryElem );
    }

    load.app = createApps[load.currFramework]( () =>
        <GlobalFrame items={{
            react: (): void => ( ( load.currFramework = 'react', load() ) ),
            vue3: (): void => ( ( load.currFramework = 'vue3', load() ) )
        }}>
            <Example />
        </GlobalFrame>
     ).mount( entryElem );
     console.log( 'Current APP:', load.currFramework );
}, {
    currFramework: 'react' as ( 'react' | 'vue3' ),
    app: null
} );

load();

// react
/*
route.register( {
    id: 'react',
    path: '/react',
    parent: undefined,
    enter: () => app = createReactApp( () =>
        <GlobalFrame>
            <Example />
        </GlobalFrame>
    ).mount( entryElem ),
    leave: () => app.unmount( entryElem )
} );

// vue
route.register( {
    id: 'vue',
    path: '/vue3',
    parent: undefined,
    enter: () => app = createVueApp( () =>
        <GlobalFrame>
            <Example />
        </GlobalFrame>
    ).mount( entryElem ),
    leave: () => app.unmount( entryElem )
} );

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
        entryElem.innerHTML = '<div class="test-elem">This is a test elem</div><div>Click any link above...</div>';
    },
    leave: () => {
        // eslint-disable-next-line no-console
        console.log( 'about: leaving' );
        entryElem.innerHTML = '';
    }
} );
*/

