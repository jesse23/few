/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Example from '@/examples/AsyncInitExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, createApp: Function ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Example.name} test on ${name}`, () => {
        const fixture = setupComponentTest( true );

        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Example.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            fixture.app = createApp( Example ).mount( containerElem );
            expect( containerElem.innerHTML ).toEqual( [
                '<pre>asyncVal: "undefined"</pre>'
            ].join( '' ) );

            await wait( 1000 );

            expect( containerElem.innerHTML ).toEqual( [
                '<pre>asyncVal: "async value"</pre>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
