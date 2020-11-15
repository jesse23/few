/* eslint-env jest */
import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from '../utils';

import Component, { printStack } from '@/examples/EventExample';

const createApp = getSupportedFrameworks().vue3;

describe( 'Test event sequence in react', () => {
    const fixture = setupComponentTest( true );

    afterEach( () => {
        printStack.splice( 0, printStack.length );
    } );

    it( 'Test event sequence in react', async() => {
        const containerElem = fixture.container;
        fixture.app = createApp( Component ).mount( containerElem );
        await wait();
        expect( containerElem.innerHTML ).toEqual( [
            '<div><div>',
                '<button id="button">click me!</button>',
            '</div></div>'
        ].join( '' ) );
        expect( printStack ).toEqual( [] );

        const button = document.getElementById( 'button' );
        button.click();
        await wait();
        expect( printStack ).toEqual( [
            'Framework click event for ChildComponent.',
            'Native click event for ChildComponent.',
            'Framework click event for ParentComponent.',
            'Native click event for ParentComponent.',
            'Framework click event for EventExample.',
            'Native click event for EventExample.'
        ] );
    } );
} );


