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
    createDebounceObserver
} from '@/observer';

import { now } from '@/utils';

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
        // bootObservable.bootstrap();
        observer.onStart();
        observer.onDone();
    } );
};
