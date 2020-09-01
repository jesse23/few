/* eslint-env jest */

import {
    wait,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import { setH } from '@/vDom';
import Component from './components/FunctionExample';

// debug: enable this line
// const createApp = getSupportedFrameworks().react;

// debug: comment this line
const _testSuite = ( name: string, h: any ): void =>
    // debug: enable this line
    // describe( 'debug specific suite', () => {
    describe( `${Component.name} test on ${name}`, () => {
        const fixture = setupComponentTest( true );

        // debug: enable this line
        // it( 'debug specific test', async() => {
        it( `${Component.name} test on ${name}`, async() => {
            const containerElem = fixture.container;
            setH( h );
            fixture.app = h.createApp( Component ).mount( containerElem );
            expect( containerElem.innerHTML ).toEqual( [
                '<div>Hello dummy</div>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, dep ] ) => _testSuite( name, dep ) );
