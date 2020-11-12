/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    typeToInputElement,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/FieldExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest();

        // https://github.com/jsdom/jsdom/commit/ea6a2e4143cf67e30b528eb32d7b6c0b88595846
        // inputElem.value = 'a' will not change DOM but browser will interpret it correctly
        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Component.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            fixture.app = createApp( Component ).mount( containerElem );
            await wait();

            // age field
            const ageInputElem = document.getElementById( 'age' ) as HTMLInputElement;
            expect( ageInputElem.type ).toEqual( 'number' );
            expect( ageInputElem.required ).toEqual( false );
            expect( ageInputElem.parentElement.querySelector( 'label' ).innerHTML ).toEqual( 'age: ' );
            expect( ageInputElem.parentElement.querySelector( 'span' ) ).toBeNull();
            expect( ageInputElem.parentElement.querySelector( 'code' ).textContent ).toEqual( '' );

            //// type in number
            typeToInputElement( ageInputElem, '123' );
            await wait();
            expect( ageInputElem.value ).toEqual( '123' );

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
            expect( ageInputElem.value ).toEqual( '123' );

            // reset button
            const resetButton = document.getElementById( 'reset' ) as HTMLButtonElement;
            resetButton.click();
            await wait();

            expect( ageInputElem.value ).toEqual( '' );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
