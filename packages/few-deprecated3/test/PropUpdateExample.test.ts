/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';

import Component from '@/examples/PropUpdateExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest( true );
    it( `Test property by ref on ${name}`, async() => {
        const containerElem = fixture.container;
        fixture.app = createApp( Component ).mount( containerElem );
        expect( containerElem.innerHTML ).toEqual( [
            '<div>X: 0, Y: 0</div>',
            '<button id="clickOnSub">+1 in Stateful Component</button>',
            '<div>X: 0, Y: 0</div>',
            '<button id="clickOnParent">+1 in Stateless Component</button>'
        ].join( '' ) );

        const buttonOnSub = document.getElementById( 'clickOnSub' );
        buttonOnSub.click();
        await wait();
        expect( containerElem.innerHTML ).toEqual( [
            '<div>X: 1, Y: 0</div>',
            '<button id="clickOnSub">+1 in Stateful Component</button>',
            '<div>X: 0, Y: 0</div>',
            '<button id="clickOnParent">+1 in Stateless Component</button>'
        ].join( '' ) );

        const buttonOnParent = document.getElementById( 'clickOnParent' );
        buttonOnParent.click();
        await wait();
        expect( containerElem.innerHTML ).toEqual( [
            '<div>X: 1, Y: 0</div>',
            '<button id="clickOnSub">+1 in Stateful Component</button>',
            '<div>X: 1, Y: 0</div>',
            '<button id="clickOnParent">+1 in Stateless Component</button>'
        ].join( '' ) );
    } );
} );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
