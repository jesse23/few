/* eslint-env jest */

import {
    wait,
    setupComponentTest
} from '../utils';

import {
    useEffect,
    useState,
    createElement as h,
    memo
} from 'react';
import { render } from 'react-dom';

const printStack = [] as string[];

////////////////////////////////
// No Property Widget
////////////////////////////////
const NoPropWidget = ( props: unknown ): JSX.Element => {
    useEffect( () => {
        printStack.push( 'NoPropWidget:prop changed' );
    }, [ props ] );

    return <div>No Prop Widget</div>;
};
NoPropWidget.displayName = 'NoPropWidget';

const NoPropContainer = (): JSX.Element => {
    const setState = useState( {} )[1];

    return (
        <div>
            <NoPropWidget />
            <button id='button1' onClick={() => void setState( {} )}>button1</button>
        </div>
    );
};
NoPropContainer.displayName = 'NoPropContainer';

////////////////////////////////
// Constant Property Widget
////////////////////////////////
const ConstantWidget = ( props: { value: string } ): JSX.Element => {
    useEffect( () => {
        printStack.push( 'ConstantWidget:prop changed' );
    }, [ props ] );

    useEffect( () => {
        printStack.push( 'ConstantWidget:prop.value changed' );
    }, [ props.value ] );

    return <div>{props.value as string}</div>;
};
ConstantWidget.displayName = 'ConstantWidget';

const ConstantContainer = (): JSX.Element => {
    const setState = useState( {} )[1];

    return (
        <div>
            <ConstantWidget value='8' />
            <button id='button1' onClick={() => void setState( {} )}>button1</button>
        </div>
    );
};
ConstantContainer.displayName = 'ConstantContainer';

////////////////////////////////
// Immutable Property Change
////////////////////////////////
const ChangeWidget = ( props: { scope: { subScope: { value: string } } } ): JSX.Element => {
    useEffect( () => {
        printStack.push( 'ChangeWidget:prop changed' );
    }, [ props ] );

    useEffect( () => {
        printStack.push( 'ChangeWidget:prop.scope changed' );
    }, [ props.scope ] );

    useEffect( () => {
        printStack.push( 'ChangeWidget:prop.scope.subScope changed' );
    }, [ props.scope.subScope ] );

    useEffect( () => {
        printStack.push( 'ChangeWidget:prop.scope.subScope.value changed' );
    }, [ props.scope.subScope.value ] );

    const [ _, setState ] = useState( {} );

    return (
        <div>
            <div>{props.scope.subScope.value as string}</div>
            <button id='changeWidget' onClick={(): void => {
                setState( {} );
            }}>changeWidget</button>
        </div>
    );
};
ChangeWidget.displayName = 'ChangeWidget';

const ChangeContainer = (): JSX.Element => {
    const [ state, setState ] = useState( {
        scope: {
            subScope: {
                value: 'aa'
            }
        }
    } );

    return (
        <div>
            <ChangeWidget scope={state.scope} />
            <button id='changeState' onClick={(): void => {
                setState( { ...state } );
            }}>changeState</button>
            <button id='changeScope' onClick={(): void => {
                state.scope = { ...state.scope };
                setState( { ...state } );
            }}>changeScope</button>
            <button id='changeSubScope' onClick={(): void => {
                state.scope.subScope = { ...state.scope.subScope };
                setState( { ...state } );
            }}>changeSubScope</button>
            <button id='changeValue' onClick={(): void => {
                state.scope.subScope.value = 'bb';
                setState( { ...state } );
            }}>changeValue</button>
        </div>
    );
};
ChangeContainer.displayName = 'ChangeContainer';

////////////////////////////////
// Memo Widget
////////////////////////////////
const MemoWidget = memo( ( props: { value: string; obj: { [key: string]: string } } ): JSX.Element => {
    useEffect( () => {
        printStack.push( 'MemoWidget:prop changed' );
    }, [ props ] );

    useEffect( () => {
        printStack.push( 'MemoWidget:prop.value changed' );
    }, [ props.value ] );

    useEffect( () => {
        printStack.push( 'MemoWidget:prop.obj.value changed' );
    }, [ props.obj.value ] );

    return <div>{props.value as string}</div>;
} );
MemoWidget.displayName = 'MemoWidget';

const MemoContainer = (): JSX.Element => {
    const [ state, setState ] = useState( {
        value: 'value',
        obj: {
            value: 'obj.value'
        }
    } );

    return (
        <div>
            <MemoWidget value={state.value} obj={state.obj} />
            <button id='changeValue' onClick={(): void => {
                setState( { ...state, value: 'value1' } );
            }}>changeValue</button>
            <button id='objectMutation' onClick={(): void => {
                state.obj.value = 'obj.value2';
                setState( { ...state } );
            }}>objectMutation</button>
        </div>
    );
};
MemoContainer.displayName = 'MemoContainer';

describe( 'react features', () => {
    const fixture = setupComponentTest();

    afterEach( () => {
        printStack.splice( 0, printStack.length );
    } );

    it( 'Test useEffect on no prop widget', async() => {
        render( <NoPropContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'NoPropWidget:prop changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'button1' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'NoPropWidget:prop changed'
        ] );
    } );

    it( 'Test useEffect on constant prop widget', async() => {
        render( <ConstantContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ConstantWidget:prop changed',
            'ConstantWidget:prop.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'button1' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'ConstantWidget:prop changed'
        ] );
    } );

    it( 'Test useEffect for changeState on ChangeContainer', async() => {
        render( <ChangeContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed',
            'ChangeWidget:prop.scope.subScope changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'changeState' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed'
        ] );
    } );

    it( 'Test useEffect for changeScope on ChangeContainer', async() => {
        render( <ChangeContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed',
            'ChangeWidget:prop.scope.subScope changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'changeScope' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed'
        ] );
    } );

    it( 'Test useEffect for changeSubScope on ChangeContainer', async() => {
        render( <ChangeContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed',
            'ChangeWidget:prop.scope.subScope changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'changeSubScope' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope.subScope changed'
        ] );
    } );

    it( 'Test useEffect for changeValue on ChangeContainer', async() => {
        render( <ChangeContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed',
            'ChangeWidget:prop.scope.subScope changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'changeValue' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
    } );

    it( 'Test useEffect for changeWidget on ChangeWidget', async() => {
        render( <ChangeContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'ChangeWidget:prop changed',
            'ChangeWidget:prop.scope changed',
            'ChangeWidget:prop.scope.subScope changed',
            'ChangeWidget:prop.scope.subScope.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // click
        const button = document.getElementById( 'changeWidget' );
        button.click();
        await wait();

        expect( printStack ).toEqual( [
        ] );
    } );

    it( 'Test React.memo behavior', async() => {
        render( <MemoContainer />, fixture.container );

        // init
        await wait();
        expect( printStack ).toEqual( [
            'MemoWidget:prop changed',
            'MemoWidget:prop.value changed',
            'MemoWidget:prop.obj.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // change value
        const button1 = document.getElementById( 'changeValue' );
        button1.click();
        await wait();
        expect( printStack ).toEqual( [
            'MemoWidget:prop changed',
            'MemoWidget:prop.value changed'
        ] );
        printStack.splice( 0, printStack.length );

        // object mutation
        const button2 = document.getElementById( 'objectMutation' );
        button2.click();
        expect( printStack ).toEqual( [
        ] );
    } );
} );
