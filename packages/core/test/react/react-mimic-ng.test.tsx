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

type NgScope = Props & {
    $digest?: Function;
    $apply?: Function;
    $parent?: NgScope;
}

const useScope = ( props: object ): NgScope => {
    const [ $scope, setScope ]: [NgScope, Function] = useState( {
        ...props
    } );

    // $scope.$digest
    $scope.$digest = (): void => setScope( { ...$scope } );

    // $scope.apply
    // https://stackoverflow.com/questions/35826219/angular-scope-digest-vs-scope-apply
    $scope.$apply = ( callback: Function ): void => {
        let r = $scope;
        while ( r.$parent ) {
            r = r.$parent;
        }

        callback && callback();

        r.$digest();
    };

    return $scope;
};

const ChildComponent = ( props: Props ): JSX.Element => {
    const $scope = useScope( props );

    return (
        <>
            <code id='childText'>Child: {$scope.prop.value}</code>
            <button id='clickDigest' onClick={
                (): void => $scope.prop.value++ && $scope.$digest()
            }>+1 and digest</button>
            <button id='clickApply' onClick={
                (): void => $scope.prop.value++ && $scope.$apply()
            }>+1 and apply</button>
        </>
    );
};
ChildComponent.displayName = 'ChildComponent';

const ParentComponent = ( props: Props ): JSX.Element => {
    const $scope = useScope( props );
    return (
        <>
            <code id='parentText'>Parent: {$scope.prop.value}</code>
            <ChildComponent prop={$scope.prop} $parent={$scope}></ChildComponent>
        </>
    );
};
ParentComponent.displayName = 'ParentComponent';

describe( 'mimic angularJS by react', () => {
    const fixture = setupComponentTest();

    afterEach( () => {
        printStack.splice( 0, printStack.length );
    } );

    it( 'Test useEffect on no prop widget', async() => {
        render( <ParentComponent prop={{ value: 7 }} />, fixture.container );

        // init
        await wait();
        expect( fixture.container.innerHTML ).toEqual( [
            '<code id="parentText">Parent: 7</code>',
            '<code id="childText">Child: 7</code>',
            '<button id="clickDigest">+1 and digest</button>',
            '<button id="clickApply">+1 and apply</button>'
        ].join( '' ) );


        // click digest
        const buttonDigest = document.getElementById( 'clickDigest' );
        buttonDigest.click();
        await wait();
        expect( fixture.container.innerHTML ).toEqual( [
            '<code id="parentText">Parent: 7</code>',
            '<code id="childText">Child: 8</code>',
            '<button id="clickDigest">+1 and digest</button>',
            '<button id="clickApply">+1 and apply</button>'
        ].join( '' ) );

        // click apply
        const buttonApply = document.getElementById( 'clickApply' );
        buttonApply.click();
        await wait();
        expect( fixture.container.innerHTML ).toEqual( [
            '<code id="parentText">Parent: 9</code>',
            '<code id="childText">Child: 9</code>',
            '<button id="clickDigest">+1 and digest</button>',
            '<button id="clickApply">+1 and apply</button>'
        ].join( '' ) );
    } );
} );
