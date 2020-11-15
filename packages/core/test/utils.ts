/* eslint-env jest */

// available frame work
import type {
    App,
    CreateAppFunction
} from '@/types';

import { createApp as createReactApp } from '@/reactPolyfill';
import { createApp as createVue3App } from '@/vue3Polyfill';

import { act } from 'react-dom/test-utils';


export const getSupportedFrameworks = (): { [key: string]: CreateAppFunction } => ( {
    react: createReactApp,
    vue3: createVue3App
} );

let _mockTimerEnabled = false;

/**
 * enable mock timer
 */
export const enableMockTimer = (): void => {
    _mockTimerEnabled = true;
    jest.useFakeTimers();
};

export const setupComponentTest = ( skipMockTimer?: boolean ): {
    app: App;
    container: HTMLElement;
} => {
    const fixture = {
        app: null as App,
        container: null as HTMLElement
    };

    beforeEach( () => {
        fixture.container = document.createElement( 'div' );
        document.body.appendChild( fixture.container );
    } );

    afterEach( () => {
        const { app, container } = fixture;
        if ( app ) {
            app.unmount( container );
        }
        document.body.removeChild( container );

        fixture.app = null;
        fixture.container = null;
    } );

    if ( !skipMockTimer ) {
        enableMockTimer();
    }

    return fixture;
};

/**
 * wait for elapsed time and return a promise
 * Note: act is react-dom/jest specific but harmless to other framework
 *
 * @param elapsed elapsed time
 * @param mockReact if true use act API to mock react async call
 * @returns promise
 */
export const wait = ( elapsed = 0, mockReact = true ): Promise<void> => {
    const callback = (): Promise<void> => {
        if ( _mockTimerEnabled ) {
            jest.advanceTimersByTime( elapsed );
            return Promise.resolve();
        }

        // real timer
        return new Promise( resolve => setTimeout( resolve, elapsed ) );
    };
    return mockReact ? act( callback ) : callback();
};

/**
 * trim comments in HTML string
 * @param str HTML string
 * @returns HTML string without comments
 */
export const trimHtmlComments = ( str: string ): string =>
    str.replace( /<!--.*?-->/g, '' );


/**
 * Set value to input tag
 * https://github.com/jsdom/jsdom/commit/ea6a2e4143cf67e30b528eb32d7b6c0b88595846
 * inputElem.value = 'a' will not change DOM but brower will interpret it correclty
 * Use approach below works fine:
 * https://github.com/testing-library/dom-testing-library/blob/b31c0b9907acab6f1ea2b4f01c6e99f28db19bd6/src/events.js#L83
 *
 * @param element Input Element
 * @param value string
 */
const setValueToInputElement = ( element: HTMLInputElement, value: string ): void => {
    const {
        set: valueSetter
    } = Object.getOwnPropertyDescriptor( element, 'value' ) || {};
    const prototype = Object.getPrototypeOf( element );
    const {
        set: prototypeValueSetter
    } = Object.getOwnPropertyDescriptor( prototype, 'value' ) || {};

    if ( prototypeValueSetter && valueSetter !== prototypeValueSetter ) {
        prototypeValueSetter.call( element, value );
        /* istanbul ignore next (I don't want to bother) */
    } else if ( valueSetter ) {
        valueSetter.call( element, value );
    } else {
        throw new Error( 'The given element does not have a value setter' );
    }
};

export const typeToInputElement = ( element: HTMLInputElement, value: string ): void => {
    setValueToInputElement( element, element.value + value );

    element.dispatchEvent( new InputEvent( 'input', {
        bubbles: true,
        cancelable: false,
        inputType: 'insertText',
        data: value
    } ) );

    /*
    // change event is OK on react, but not vue
    textElem.dispatchEvent( new Event( 'change', {
        bubbles: true,
        cancelable: false,
        composed: false
    } ) );
    */
};

// https://github.com/w3c/input-events/issues/30
export const cleanInputElement = ( element: HTMLInputElement ): void => {
    setValueToInputElement( element, '' );

    element.dispatchEvent( new InputEvent( 'input', {
        bubbles: true,
        cancelable: false,
        inputType: 'deleteContent',
        data: ''
    } ) );
};
