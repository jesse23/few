/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/WatcherExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest();

        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Component.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            fixture.app = createApp( Component ).mount( containerElem );

            // init
            await wait();
            expect( containerElem.innerHTML ).toEqual( [
                '<div>',
                  '<div style="color: green;">',
                    '<code>This is a DOM component</code>',
                  '</div>',
                  '<button id="switchColor">Switch Color</button>',
                '</div>'
            ].join( '' ) );

            // click switch click button
            const button = document.getElementById( 'switchColor' );
            button.click();
            await wait();
            expect( containerElem.innerHTML ).toEqual( [
                '<div>',
                  '<div style="color: black;">',
                    '<code>This is a DOM component</code>',
                  '</div>',
                  '<button id="switchColor">Switch Color</button>',
                '</div>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
