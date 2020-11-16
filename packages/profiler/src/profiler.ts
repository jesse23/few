import { STATE } from '@/types';

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

/*
export const STATE = {
    IDLE: Symbol( 'IDLE' ),
    HOLD: Symbol( 'HOLD' ),
    WAIT: Symbol( 'WAIT' ),
    DONE: Symbol( 'DONE' )
};
*/


const _globalSetTimeout = setTimeout;

const _globalClearTimeout = clearTimeout;

export const createProfiler = ( interval = BUSY_INTERVAL ): any => {
    let _promise: Promise<number>;

    let _state = STATE.IDLE;

    const _watchers = [] as any[];

    const addWatcher = ( watcher: {} ) => _watchers.push( watcher );

    const profile = () => {
        _promise = _promise || new Promise( ( resolve, reject ) => {
            // start time
            const startTime = now();


            const complete = () => {
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
                if( _counter === 0 ) {
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
        get state(): STATE {
            return _state;
        },
        get active(): boolean {
            return _state === STATE.HOLD || _state === STATE.WAIT;
        },
        addWatcher,
        profile
    };
};
