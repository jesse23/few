/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Example from '@/examples/DomRefExample';

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

            // vue will run mount in almost sync mode, react will apply it
            // in async way
            await wait();

            expect( containerElem.innerHTML ).toEqual( [
                '<div><code>This is a DOM component</code></div>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
