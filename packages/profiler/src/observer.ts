import {
    Options,
    STATE,
    Observer,
    PerfObserver
} from '@/types';

import {
    createState
} from '@/state';

import {
    now
} from '@/utils';

interface DebounceObserver extends Observer {
    getState: () => STATE;
}

export const createDebounceObserver = (
    resolve: ( value?: unknown ) => void = () => void null,
    reject: ( reason?: string ) => void = () => void null,
    options?: Options
): DebounceObserver => {
    let _counter = 0;

    const state = createState( () => {
        resolve();
    }, ( reason ) => {
        reject( reason );
    }, options );

    return {
        getState: (): STATE => {
            return state.state;
        },
        onStart: (): void => {
            if ( _counter === 0 ) {
                state.toHold();
            }
            _counter++;
        },
        onDone: (): void => {
            _counter = _counter > 0 ? _counter - 1 : 0;
            if ( _counter === 0 ) {
                state.toWait();
            }
        }
    };
};

export const createCountObserver = (): PerfObserver => {
    let _counter = 0;
    return {
        onStart: () => void null,
        onDone: ( { count } ): void => {
            _counter += count;
        },
        getMetrics: (): number => {
            return _counter;
        },
        reset: (): void => {
            _counter = 0;
        }
    };
};

export const createTtiObserver = (): PerfObserver => {
    const timestamps = {
        start: 0,
        complete: 0
    };
    return {
        onStart: (): void => {
            if( timestamps.start === 0 ) {
                timestamps.start = now();
            }
        },
        onDone: (): void => {
            // it will keep updating until last done
            timestamps.complete = now();
        },
        getMetrics: (): number => {
            return timestamps.complete - timestamps.start;
        },
        reset: (): void => {
            timestamps.start = 0;
            timestamps.complete = 0;
        }
    };
};

