import {
    Observer,
    Options,
    STATE
} from '@/types';

import {
    createState
} from '@/state';

import {
    now
} from '@/utils';

interface MockObserver extends Observer {
    getMetrics: () => number;
    reset: () => void;
}

export const createMockObserver = (): MockObserver => {
    let _res = 0;
    return {
        onStart: () => void null,
        onDone: ( { count } ): void => {
            _res += count;
        },
        getMetrics: (): number => {
            return _res;
        },
        reset: (): void => {
            _res = 0;
        }
    };
};

export const createTtiObserver = (): MockObserver => {
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

