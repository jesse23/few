/* eslint-env jest */

import {
    wait,
    trimHtmlComments,
    setupComponentTest,
    getSupportedFrameworks
} from './utils';
import Component from '@/examples/AsyncDispatchExample';

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
            expect( trimHtmlComments( containerElem.innerHTML ) ).toEqual( [
                '<div>',
                  '<button id="button1">value1</button>',
                  '<div id="value1"></div>',
                  '<button id="button2">value2</button>',
                  '<div id="value2"></div>',
                  '<button id="button3">value3</button>',
                  '<div id="value3"></div>',
                '</div>'
            ].join( '' ) );

            // await is not required for react case
            const buttonElem1 = document.getElementById( 'button1' );
            const buttonElem2 = document.getElementById( 'button2' );
            const buttonElem3 = document.getElementById( 'button3' );

            buttonElem3.click();
            await wait( 1000 );
            buttonElem1.click();
            await wait( 1000 );
            buttonElem2.click();
            await wait( 1500 );

            expect( trimHtmlComments( containerElem.innerHTML ) ).toEqual( [
                '<div>',
                  '<button id="button1">value1</button>',
                  '<div id="value1">value1</div>',
                  '<button id="button2">value2</button>',
                  '<div id="value2">value2</div>',
                  '<button id="button3">value3</button>',
                  '<div id="value3">value3</div>',
                '</div>'
            ].join( '' ) );
        } );
    } );

// debug: comment this line
Object.entries( getSupportedFrameworks() ).forEach( ( [ name, createApp ] ) => _testSuite( name, createApp ) );
