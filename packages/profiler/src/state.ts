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
 * resolve: (value?: unknown) => void, reject: (reason?: any)
 *
 * @param resolve callback when state => DONE
 * @param reject callback when state => ERROR
 * @param options profiler options
 * @returns profiler object
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
