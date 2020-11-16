import {
    STATE,
    Observable,
    Observer,
    Profiler
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
 * origin setTimeout call
 */
const _globalSetTimeout = setTimeout;

/**
 * origin clearTimeout call
 */
const _globalClearTimeout = clearTimeout;

// profiler -> watcher -> service

/**
 * Create profiler for watching performance passively in for given event loop
 *
 * https://github.com/GoogleChromeLabs/tti-polyfill
 *
 * @param interval interval for waiting next signal
 * @returns profiler object
 */
export const createProfiler = ( interval = BUSY_INTERVAL ): Profiler => {
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
                        _globalClearTimeout( _timeoutId );
                        _timeoutId = null;

                        // WAIT -> HOLD
                        _state = STATE.HOLD;
                    }
                    _counter++;
                },
                onDone: () => {
                    _counter = _counter > 0 ? _counter - 1 : 0;
                    if ( _counter === 0 ) {
                        _globalClearTimeout( _timeoutId );
                        _timeoutId = _globalSetTimeout( observer.onComplete, interval );
                        // HOLD -> WAIT
                        _state = STATE.WAIT;
                    }
                },
                onComplete: () => {
                    _obs.forEach( ob => {
                        ob.unsubscribe( observer );
                    } );

                    _state = STATE.DONE;

                    resolve( now() - startTime - interval );
                }
            };

            _timeoutId = _globalSetTimeout( observer.onComplete, interval );

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
