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

export const createDebounceObserver = (
    resolve: ( value?: unknown ) => void = () => void null,
    reject: ( reason?: string ) => void = () => void null,
    options?: Options
): Observer => {
    let _counter = 0;

    const state = createState( () => {
        resolve();
    }, ( reason ) => {
        reject( reason );
    }, options );

    return {
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

export const profile = ( observables: Observable[] = [], options?: Options ): Promise<number> => {
    return new Promise( ( resolve, reject ) => {
        const startTime = now();
        const observer = createDebounceObserver( () => {
            observables.forEach( ob => {
                ob.unsubscribe( observer );
            } );
            resolve( now() - startTime - 200 );
        }, reason => {
            observables.forEach( ob => {
                ob.unsubscribe( observer );
            } );
            reject( reason );
        }, options );

        observables.forEach( ob => {
            ob.subscribe( observer as Observer );
        } );

        // TODO: quick hack - we know DebounceObserver.onDone is toWait
        observer.onDone();
    } );
};
