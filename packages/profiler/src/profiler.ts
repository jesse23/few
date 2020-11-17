import {
    STATE,
    Observable,
    Observer,
    Profiler,
    Options
} from '@/types';

/**
 * Get current timestamp
 *
 * @returns current timestamp as number
 */
export const now = (): number => {
    if ( window && window.performance ) {
        return window.performance.now();
    }
    return Date.now();
};

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
    maxWait:  MAX_WAIT_INTERVAL
};

/**
 * Create profiler for watching performance passively in for given event loop
 *
 * https://github.com/GoogleChromeLabs/tti-polyfill
 *
 * @param options profiler options
 * @returns profiler object
 */
export const createProfiler = ( options: Options = defaultOptions ): Profiler => {
    const _options: Options = {
        ...defaultOptions,
        ...options
    };

    let _promise: Promise<number>;

    let _state = STATE.IDLE;

    const _obs = [] as Observable[];

    const profile = (): Promise<number> => {
        _promise = _promise || new Promise( ( resolve, reject ) => {
            // start time
            const startTime = now();
            let _counter = 0;
            let _timeoutId: NodeJS.Timeout;
            const observer: Observer = {
                onStart: () => {
                    if ( _counter === 0 ) {
                        // WAIT -> HOLD
                        _state = STATE.HOLD;

                        _globalClearTimeout( _timeoutId );
                        _timeoutId = _globalSetTimeout( observer.onTimeout, _options.maxWait );
                    }
                    _counter++;
                },
                onDone: () => {
                    _counter = _counter > 0 ? _counter - 1 : 0;
                    if ( _counter === 0 ) {
                        _globalClearTimeout( _timeoutId );
                        _timeoutId = _globalSetTimeout( observer.onComplete, _options.interval );
                        // HOLD -> WAIT
                        _state = STATE.WAIT;
                    }
                },
                onComplete: () => {
                    _obs.forEach( ob => {
                        ob.unsubscribe( observer );
                    } );

                    _state = STATE.DONE;

                    resolve( now() - startTime - _options.interval );
                },
                onTimeout: () => {
                    _obs.forEach( ob => {
                        ob.unsubscribe( observer );
                    } );
                    _state = STATE.DONE;
                    reject( `Time out in HOLD status after ${_options.maxWait}ms` );
                }
            };

            _timeoutId = _globalSetTimeout( observer.onComplete, _options.interval );

            // start
            _obs.forEach( ob => {
                ob.subscribe( observer );
            } );

            // IDLE -> WAIT
            _state = STATE.WAIT;
        } );
        return _promise;
    };

    return {
        profile,
        addObservable: ob => void _obs.push( ob ),
        get state(): STATE {
            return _state;
        },
        get active(): boolean {
            return _state === STATE.HOLD || _state === STATE.WAIT;
        }
    };
};
