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
    Observable,
    Observer,
    Options
} from '@/types';

import {
    createState
} from '@/state';

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

export const profile = ( observables: Observable[] = [], options?: Options ): Promise<number> => {
    return new Promise( ( resolve, reject ) => {
        // start time
        const startTime = now();
        let _counter = 0;
        const observer = {} as Observer;
        const state = createState( () => {
            observables.forEach( ob => {
                ob.unsubscribe( observer );
            } );

            resolve( now() - startTime - state.interval );
        }, ( reason ) => reject( reason ), options );

        observer.onStart = (): void => {
            if ( _counter === 0 ) {
                state.toHold();
            }
            _counter++;
        };

        observer.onDone = (): void => {
            _counter = _counter > 0 ? _counter - 1 : 0;
            if ( _counter === 0 ) {
                state.toWait();
            }
        };

        observables.forEach( ob => {
            ob.subscribe( observer as Observer );
        } );

        // launch
        // if we skip _toWait but just wire it up with observable
        // it will make it 'passive'
        state.toWait();
    } );
};
