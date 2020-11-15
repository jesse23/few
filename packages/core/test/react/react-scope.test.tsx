/* eslint-env jest */

import type { Props } from '@/types';

import {
    wait,
    setupComponentTest
} from '../utils';

import {
    useState,
    createElement,
    Fragment
} from 'react';
import { render } from 'react-dom';

const h = createElement as { Fragment?: Function };
h.Fragment = Fragment;

const printStack = [] as string[];

const actionDef = async( state: any ): Promise<void> =>{
    setTimeout( (): void => void printStack.push( `${JSON.stringify( state )}` ), 500 );
};

let createAction = ( actionDef: Function, hook: any ): Function => (): void => null;

const Component = (): JSX.Element => {
    const hook = useState( () => ( {
        a: 3,
        b: 0
    } ) );

    // const action = (): void => void actionDef( state );

    const action = createAction( actionDef, hook );

    return (
        <>
            <div>{JSON.stringify( hook[0] )}</div>
            <button id='button' onClick={() => void action()}>button</button>
        </>
    );
};
Component.displayName = 'Component';

describe( 'Scope design in react', () => {
    const fixture = setupComponentTest();

    afterEach( () => {
        printStack.splice( 0, printStack.length );
    } );

    it( 'Mutable operation on state will reflect in binding', async() => {
        createAction = ( actionDef: Function, hook: any ): Function => (): void => {
            const [ state, setState ] = hook;
            actionDef( state );
            state.b = 7;
            setState( { ...state } );
        };
        render( <Component />, fixture.container );

        // init
        await wait();
        expect( fixture.container.innerHTML ).toEqual( [
            '<div>{"a":3,"b":0}</div>',
            '<button id="button">button</button>'
        ].join( '' ) );


        // click digest
        const buttonElem = document.getElementById( 'button' );
        buttonElem.click();
        await wait( 500 );
        expect( fixture.container.innerHTML ).toEqual( [
            '<div>{"a":3,"b":7}</div>',
            '<button id="button">button</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            '{"a":3,"b":7}'
        ] );
    } );

    it( 'Immutable operation on state will not reflect in binding', async() => {
        createAction = ( actionDef: Function, hook: any ): Function => (): void => {
            const [ state, setState ] = hook;
            actionDef( state );
            setState( { ...state, b: 7 } );
        };
        render( <Component />, fixture.container );

        // init
        await wait();
        expect( fixture.container.innerHTML ).toEqual( [
            '<div>{"a":3,"b":0}</div>',
            '<button id="button">button</button>'
        ].join( '' ) );


        // click
        const buttonElem = document.getElementById( 'button' );
        buttonElem.click();
        await wait( 500 );
        expect( fixture.container.innerHTML ).toEqual( [
            '<div>{"a":3,"b":7}</div>',
            '<button id="button">button</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            '{"a":3,"b":0}'
        ] );
    } );
} );
