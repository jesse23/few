import { STATE, Watcher, Profiler } from '@/types';

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

export const createProfiler = ( interval = BUSY_INTERVAL ): Profiler => {
    let _promise: Promise<number>;

    let _state = STATE.IDLE;

    const _watchers = [] as Watcher[];

    const profile = (): Promise<number> => {
        _promise = _promise || new Promise( ( resolve, reject ) => {
            // start time
            const startTime = now();

            const complete = (): void => {
                _watchers.forEach( watcher => {
                    watcher.unregister();
                } );

                _state = STATE.DONE;

                resolve( now() - startTime - interval );
            };

            let timeoutID = _globalSetTimeout( complete, interval );

            let _counter = 0;
            const _onStart = (): void => {
                if ( _counter === 0 ) {
                    _globalClearTimeout( timeoutID );
                    timeoutID = null;

                    // WAIT -> HOLD
                    _state = STATE.HOLD;
                }
                _counter++;
            };

            const _onDone = (): void => {
                _counter = _counter > 0 ? _counter - 1 : 0;
                if ( _counter === 0 ) {
                    _globalClearTimeout( timeoutID );
                    timeoutID = _globalSetTimeout( complete, interval );
                    // HOLD -> WAIT
                    _state = STATE.WAIT;
                }
            };

            // start
            _watchers.forEach( watcher => {
                watcher.register( _onStart, _onDone );
            } );

            // IDLE -> WAIT
            _state = STATE.WAIT;
        } );
        return _promise;
    };

    return {
        profile,
        addWatcher: watcher => void _watchers.push( watcher ),
        get state(): STATE {
            return _state;
        },
        get active(): boolean {
            return _state === STATE.HOLD || _state === STATE.WAIT;
        }
    };
};
