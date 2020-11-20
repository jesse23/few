/**
 * - In a given client, there will be a set of resources as 'observable'
 *   - JS Event Loop Entry ( setTimeout, Promise, XHR.onLoad )
 *   - XHR (server request, maybe by domain later)
 *   - Mutation Observer (dom change)
 *   - Location change event (popstate, hashchange)
 *   - DOM Event ( click, input... )
 *   - ResizeObserver?
 *   - RAF?
 *
 * - Not all observable will trigger 'profile' - only Location and DOM Event
 *
 * - Each observable might have its own metrics on its cycle
 *
 * - TTI polyfill is used to decide onComplete for an operation
 *
 * - For specific profiler, the output format and destination should be fixed
 */
import {
    STATE,
    State,
    Options
} from '@/types';

/**
 * Default busy interval
 */
export const BUSY_INTERVAL = 200;

/**
 * Max wait interval
 */
export const MAX_WAIT_INTERVAL = 30000;

/**
 * origin setTimeout call
 */
let _globalSetTimeout = setTimeout;

/**
 * origin clearTimeout call
 */
let _globalClearTimeout = clearTimeout;

export const reset = (): void => {
    _globalClearTimeout = clearTimeout;
    _globalSetTimeout = setTimeout;
};

const defaultOptions: Options = {
    interval: BUSY_INTERVAL,
    maxWait: MAX_WAIT_INTERVAL
};

/**
 * Create state object for profiler
 *
 * https://github.com/GoogleChromeLabs/tti-polyfill
 *
 * @param options profiler options
 * @returns profiler object
 */
/*

resolve: (value?: unknown) => void, reject: (reason?: any)
*/
export const createState = (
    resolve: ( value?: unknown ) => void = () => void null,
    reject: ( reason?: string ) => void = () => void null,
    options: Options = defaultOptions
): State => {
    const _options: Options = {
        ...defaultOptions,
        ...options
    };

    let _state = STATE.IDLE;

    let _timeoutId: NodeJS.Timeout;

    const state: State = {
        // after register, current observer will react to next onStart
        get state(): STATE {
            return _state;
        },
        get active(): boolean {
            return _state === STATE.HOLD || _state === STATE.WAIT;
        },
        get interval(): number {
            return _options.interval;
        },
        toWait: (): void => {
            _globalClearTimeout( _timeoutId );
            _timeoutId = _globalSetTimeout( state.toDone, _options.interval );
            _state = STATE.WAIT;
        },
        toHold: (): void => {
            _globalClearTimeout( _timeoutId );
            _timeoutId = _globalSetTimeout( state.toError, _options.maxWait );
            _state = STATE.HOLD;
        },
        toDone: (): void => {
            // observer._unregister();
            _state = STATE.DONE;

            // TODO: temp fix for session
            // _promise = null;

            resolve( null );
        },
        toError: (): void => {
            // observer._unregister();
            _state = STATE.ERROR;
            reject( `Time out in HOLD status after ${_options.maxWait}ms` );
        }
    };

    return state;
};
