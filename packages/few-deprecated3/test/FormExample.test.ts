/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    typeToInputElement,
    cleanInputElement,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/FormExample';

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

            // name field
            const nameInputElem = document.getElementById( 'name' ) as HTMLInputElement;
            expect( nameInputElem.type ).toEqual( 'text' );
            expect( nameInputElem.required ).toEqual( true );
            expect( nameInputElem.checkValidity() ).toEqual( false );
            expect( nameInputElem.parentElement.querySelector( 'label' ).innerHTML ).toEqual( 'name*: ' );
            expect( nameInputElem.parentElement.querySelector( 'span' ).outerHTML ).toEqual( '<span class="validity"></span>' );
            expect( nameInputElem.parentElement.querySelector( 'code' ) ).toBeNull();

            //// type in
            typeToInputElement( nameInputElem, 'John' );
            await wait();
            expect( nameInputElem.value ).toEqual( 'John' );
            expect( nameInputElem.checkValidity() ).toEqual( true );

            // age field
            const ageInputElem = document.getElementById( 'age' ) as HTMLInputElement;
            expect( ageInputElem.type ).toEqual( 'number' );
            expect( ageInputElem.required ).toEqual( false );
            expect( ageInputElem.parentElement.querySelector( 'label' ).innerHTML ).toEqual( 'age: ' );
            expect( ageInputElem.parentElement.querySelector( 'span' ) ).toBeNull();
            expect( ageInputElem.parentElement.querySelector( 'code' ).textContent ).toEqual( '' );

            //// type in text to number field
            typeToInputElement( ageInputElem, 'John' );
            await wait();
            expect( ageInputElem.value ).toEqual( '' );

            //// type in number
            typeToInputElement( ageInputElem, '123' );
            await wait();
            expect( ageInputElem.value ).toEqual( '123' );

            //// delete content
            cleanInputElement( ageInputElem );
            await wait();
            expect( ageInputElem.value ).toEqual( '' );
            expect( ageInputElem.parentElement.querySelector( 'code' ).textContent ).toEqual( 'cannot be empty' );

            //// set value back
            typeToInputElement( ageInputElem, '456' );
            await wait();
            expect( ageInputElem.value ).toEqual( '456' );
            expect( ageInputElem.parentElement.querySelector( 'code' ).textContent ).toEqual( '' );

            // test field
            const testInputElem = document.getElementById( 'isAdmin' ) as HTMLInputElement;
            expect( testInputElem.type ).toEqual( 'checkbox' );
            expect( testInputElem.required ).toEqual( false );
            expect( testInputElem.checked ).toEqual( false );
            expect( testInputElem.parentElement.querySelector( 'label' ).innerHTML ).toEqual( 'isAdmin: ' );
            expect( testInputElem.parentElement.querySelector( 'span' ) ).toBeNull();
            expect( testInputElem.parentElement.querySelector( 'code' ) ).not.toBeNull();

            //// check
            testInputElem.click();
            await wait();
            expect( testInputElem.checked ).toEqual( true );

            // request mock
            const requestElem = document.getElementById( 'form-request' );
            expect( requestElem.textContent ).toEqual( 'Form Request: ' );

            //// submit
            const submitButton = document.getElementById( 'submit' );
            submitButton.click();
            await wait();

            expect( requestElem.textContent ).toEqual( [
                'Form Request: {',
                '  "name": "John",',
                '  "age": 456,',
                '  "isAdmin": true',
                '}'
            ].join( '\n' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
