/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component, { mockServer } from '@/examples/UnmountExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest( true );

        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Component.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            fixture.app = createApp( Component ).mount( containerElem );
            expect( containerElem.innerHTML ).toEqual( [
                '<pre>id: loading...</pre><button id="toggleButton">toggle</button>'
            ].join( '' ) );
            expect( mockServer._server ).toEqual( {
            } );

            await wait( 1000 );

            expect( containerElem.innerHTML ).toEqual( [
                '<pre>id: GOT_john</pre><button id="toggleButton">toggle</button>'
            ].join( '' ) );
            expect( mockServer._server ).toEqual( {
                GOT_john: 'john'
            } );

            const button = document.getElementById( 'toggleButton' );
            button.click();
            await wait( 500 );
            expect( containerElem.innerHTML ).toEqual( [
                '<button id="toggleButton">toggle</button>'
            ].join( '' ) );
            expect( mockServer._server ).toEqual( {
            } );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
