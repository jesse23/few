/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/AsyncViewExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest();

        // https://github.com/jsdom/jsdom/commit/ea6a2e4143cf67e30b528eb32d7b6c0b88595846
        // inputElem.value = 'a' will not change DOM but brower will interpret it correclty
        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Component.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            fixture.app = createApp( Component ).mount( containerElem );
            await wait();

            // async element area
            const asyncViewElem = document.getElementById( 'asyncElem' ) as HTMLElement;
            expect( asyncViewElem.innerHTML ).toEqual( 'loading...' );

            // wait async load is done
            await wait( 500 );
            expect( asyncViewElem.innerHTML ).toEqual( '<code>Async String</code>' );

            // plus panel
            const plusPanelElem = document.getElementById( 'plusPanel' ) as HTMLElement;
            expect( plusPanelElem.innerHTML ).toEqual( [
                '<div>7</div>',
                '<button id="plus">+1</button>'
            ].join( '' ) );

            const plusButton = document.getElementById( 'plus' ) as HTMLButtonElement;
            plusButton.click();
            await wait();

            expect( plusPanelElem.innerHTML ).toEqual( [
                '<div>8</div>',
                '<button id="plus">+1</button>'
            ].join( '' ) );

            // make sure async element state is not changed
            expect( asyncViewElem.innerHTML ).toEqual( '<code>Async String</code>' );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
