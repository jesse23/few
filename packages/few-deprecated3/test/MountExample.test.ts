/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/MountExample';

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
                '<pre>{}</pre>'
            ].join( '' ) );

            await wait( 500 );

            expect( containerElem.innerHTML ).toEqual( [
                '<pre>{"mountVal":"initVal"}</pre>'
            ].join( '' ) );

            await wait( 500 );

            expect( containerElem.innerHTML ).toEqual( [
                '<pre>{"mountVal":"mountVal"}</pre>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
