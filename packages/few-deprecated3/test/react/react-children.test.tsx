/* eslint-env jest */

import type { Props } from '@/types';

import {
    wait,
    setupComponentTest
} from '../utils';

import {
    useState,
    useCallback,
    createElement,
    Fragment,
    useEffect
} from 'react';
import { render } from 'react-dom';

const h = createElement as { Fragment?: Function };
h.Fragment = Fragment;

const printStack = [] as string[];

const FunctionSlot = ( props: Props ): JSX.Element => {
    return (
        <div id='function-slot'>
            {props.children( { name: 'function' } )}
        </div>
    );
};
FunctionSlot.displayName = 'SlotComponent';

const ComponentSlot = ( props: Props ): JSX.Element => {
    return (
        <div id='component-slot'>
            <props.children name='component' />
        </div>
    );
};
ComponentSlot.displayName = 'ComponentSlot';

const HOCSlot = ( props: Props ): JSX.Element => {
    return (
        <div id='hoc-slot'>
            <props.children name='hoc' />
        </div>
    );
};
HOCSlot.displayName = 'HOCSlot';

const TestSlot = ( { children: [ functionRes, componentRes, inlineFunc, StableFunc ] }: Props ): JSX.Element => {
    const InlineFunc = inlineFunc;
    return (
        <div id='test-slot'>
            {functionRes}
            {componentRes}
            {inlineFunc( { name: 'function-slot' } )}
            <InlineFunc name='inline-component-slot' />
            <StableFunc name='stable-component-slot' />
        </div>
    );
};
TestSlot.displayName = 'TestSlot';


const SlotExample = (): JSX.Element => {
    const TestFunc = ( props: Props ): JSX.Element => {
        const [ model, setModel ] = useState( () => {
            printStack.push( `state init for ${props.name}` );
            return {
                currNum: 7
            };
        } );

        // test update
        useEffect( () => {
            printStack.push( `useEffect in ${props.name} triggered` );
        } );

        return <>
            <div id={`${props.name}-panel`}>
                <div>{model.currNum}</div>
                <button id={`${props.name}-button`} onClick={() => void
                    setModel( { currNum: model.currNum + 1 } )
                }>+1</button>
            </div>
        </>;
    };
    TestFunc.displayName = 'TestFunc';
    const testFunc = TestFunc;

    // state at parent
    const [ model, setModel ] = useState( () => {
        printStack.push( 'state init for example' );
        return {
            currNum: 7
        };
    } );

    return (
        <>
            <TestSlot>
                {testFunc( { name:'function-res' } )}
                <TestFunc name='component-res' />
                {TestFunc}
                {useCallback( TestFunc, [] )}
            </TestSlot>
            <div id='example-panel'>
                <div>{model.currNum}</div>
                <button id='example-button' onClick={() => void
                    setModel( { currNum: model.currNum + 1 } )
                }>+1</button>
            </div>
        </>
    );
};
SlotExample.displayName = 'SlotExample';

describe( 'Test function as child in different practice', () => {
    const fixture = setupComponentTest();

    afterEach( () => {
        printStack.splice( 0, printStack.length );
    } );

    it( 'Test Rendering for SlotExample', async() => {
        render( <SlotExample />, fixture.container );

        // init
        await wait();

        expect( fixture.container.innerHTML ).toEqual( [
            '<div id="test-slot">',
              '<div id="function-res-panel">',
              '<div>7</div>',
              '<button id="function-res-button">+1</button>',
              '</div>',
              '<div id="component-res-panel">',
              '<div>7</div>',
              '<button id="component-res-button">+1</button>',
              '</div>',
              '<div id="function-slot-panel">',
              '<div>7</div>',
              '<button id="function-slot-button">+1</button>',
              '</div>',
              '<div id="inline-component-slot-panel">',
              '<div>7</div>',
              '<button id="inline-component-slot-button">+1</button>',
              '</div>',
              '<div id="stable-component-slot-panel">',
              '<div>7</div>',
              '<button id="stable-component-slot-button">+1</button>',
              '</div>',
              '</div>',
              '<div id="example-panel">',
              '<div>7</div>',
              '<button id="example-button">+1</button>',
              '</div>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // init order: function eval 1st, then 'component'
            'state init for example',
            'state init for function-res',
            'state init for function-slot',
            'state init for component-res',
            'state init for inline-component-slot',
            'state init for stable-component-slot',
            // useEffect order: component 1st (depth 1st), thn function eval
            'useEffect in component-res triggered',
            'useEffect in inline-component-slot triggered',
            'useEffect in stable-component-slot triggered',
            'useEffect in function-slot triggered',
            'useEffect in function-res triggered'
        ] );
    } );

    it( 'Test state change in example', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'example-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="example-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'example-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'example-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="example-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // component state will be reset since it is a 'ad-hoc' element
            'state init for component-res',
            'state init for inline-component-slot',
            'useEffect in component-res triggered',
            'useEffect in inline-component-slot triggered',
            'useEffect in stable-component-slot triggered',
            'useEffect in function-slot triggered',
            'useEffect in function-res triggered'
        ] );
    } );

    it( 'Test state change in function-res', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'function-res-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="function-res-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'function-res-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'function-res-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="function-res-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // state in function res is on parent scope
            'state init for component-res',
            'state init for inline-component-slot',
            'useEffect in component-res triggered',
            'useEffect in inline-component-slot triggered',
            'useEffect in stable-component-slot triggered',
            'useEffect in function-slot triggered',
            'useEffect in function-res triggered'
        ] );

        // parent state change doesn't impact current state
        document.getElementById( 'example-button' ).click();
        await wait();

        expect( document.getElementById( 'function-res-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="function-res-button">+1</button>'
        ].join( '' ) );
    } );

    it( 'Test state change in component-res', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'component-res-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="component-res-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'component-res-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'component-res-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="component-res-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // state in function res is on parent scope
            'useEffect in component-res triggered'
        ] );

        // parent state change will reset component-res state
        document.getElementById( 'function-res-button' ).click();
        await wait();

        expect( document.getElementById( 'component-res-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="component-res-button">+1</button>'
        ].join( '' ) );
    } );

    it( 'Test state change in function-slot', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'function-slot-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="function-slot-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'function-slot-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'function-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="function-slot-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // state in function res is on parent scope
            'useEffect in inline-component-slot triggered',
            'useEffect in stable-component-slot triggered',
            'useEffect in function-slot triggered'
        ] );

        // parent state change will reset component-res state
        document.getElementById( 'function-res-button' ).click();
        await wait();

        expect( document.getElementById( 'function-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="function-slot-button">+1</button>'
        ].join( '' ) );
    } );

    it( 'Test state change in inline-component-slot', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'inline-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="inline-component-slot-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'inline-component-slot-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'inline-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="inline-component-slot-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // state in function res is on parent scope
            'useEffect in inline-component-slot triggered'
        ] );

        // slot state change will not reset inline-component-slot state since parent function
        // doesn't re-evaluate (inline-component is still stable)
        document.getElementById( 'function-slot-button' ).click();
        await wait();

        expect( document.getElementById( 'inline-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="inline-component-slot-button">+1</button>'
        ].join( '' ) );

        // parent state change will reset inline-component-slot state
        document.getElementById( 'function-res-button' ).click();
        await wait();

        expect( document.getElementById( 'inline-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="inline-component-slot-button">+1</button>'
        ].join( '' ) );
    } );

    it( 'Test state change in stable-component-slot', async() => {
        render( <SlotExample />, fixture.container );
        await wait();
        printStack.splice( 0, printStack.length );

        expect( document.getElementById( 'stable-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>7</div>',
            '<button id="stable-component-slot-button">+1</button>'
        ].join( '' ) );

        const buttonElem = document.getElementById( 'stable-component-slot-button' );
        buttonElem.click();
        await wait();

        expect( document.getElementById( 'stable-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="stable-component-slot-button">+1</button>'
        ].join( '' ) );

        expect( printStack ).toEqual( [
            // state in function res is on parent scope
            'useEffect in stable-component-slot triggered'
        ] );

        // slot state change will not reset stable-component-slot state
        document.getElementById( 'function-slot-button' ).click();
        await wait();

        expect( document.getElementById( 'stable-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="stable-component-slot-button">+1</button>'
        ].join( '' ) );

        // parent state change will not reset stable-component-slot state
        document.getElementById( 'function-res-button' ).click();
        await wait();

        expect( document.getElementById( 'stable-component-slot-panel' ).innerHTML ).toEqual( [
            '<div>8</div>',
            '<button id="stable-component-slot-button">+1</button>'
        ].join( '' ) );
    } );
} );
