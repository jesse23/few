/* eslint-env jest */

import {
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/SlotExample';

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
        it( `${Component.name} test on ${name}`, () => {
            const containerElem = fixture.container;
            fixture.app = createApp( Component ).mount( containerElem );
            expect( containerElem.innerHTML ).toEqual( [
                '<button>',
                    '<div>val1</div>',
                    '<div>div2</div>',
                '</button>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
