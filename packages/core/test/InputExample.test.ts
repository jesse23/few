/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    typeToInputElement,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/InputExample';

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
            await wait();

            // input field
            const inputElem = document.getElementById( 'text' ) as HTMLInputElement;
            const dataElem = document.getElementById( 'data' ) as HTMLElement;
            expect( inputElem.value ).toEqual( '' );
            expect( dataElem.innerHTML ).toEqual( '' );

            //// typing
            typeToInputElement( inputElem, 'abc' );
            await wait();
            expect( inputElem.value ).toEqual( 'abc' );
            expect( dataElem.innerHTML ).toEqual( 'abc' );

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

            //// make sure update view not reset the Field
            expect( inputElem.value ).toEqual( 'abc' );
            expect( dataElem.innerHTML ).toEqual( 'abc' );

            // reset button
            const resetButton = document.getElementById( 'reset' ) as HTMLButtonElement;
            resetButton.click();
            await wait();

            expect( inputElem.value ).toEqual( '' );
            expect( dataElem.innerHTML ).toEqual( '' );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
