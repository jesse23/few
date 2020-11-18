import {
    Observable,
    Observer,
    Profiler,
    Session
} from '@/types';

/**
 * Creates profiler session
 *
 * Session is mainly used in `passive scenario`, for example:
 * - In browser, we create a session to profile every user interaction.
 * - We hook session up with browser click, for example.
 * - We `enable` the session, but it isn't start profiling before no action
 *   from user yet.
 * - Once user click on the UI, session will start profiling use _profiler.
 * - Once profile is done, session will `broadcast` the result to _subscriptions.
 * - _subscriptions will process the result, for example, log to console, send to
 *   analytics server....
 *
 * @param profiler profiler that used in session.
 * @returns session object
 */
export const createSession = ( profiler: Profiler ): Session => {
    const _obs = [] as Observable[];

    const _subs = [];

    const _profiler = profiler;

    let _active = false;

    return {
        enable: (): void => {
            _active = true;

            const observer: Observer = {
                onStart: () => {
                    _profiler.profile();
                },
                onDone: () => {
                    console.log( 'onDone' );
                },
                onComplete: () => {
                    console.log( 'onComplete' );
                },
                onTimeout: () => {
                    console.log( 'onTimeout' );
                }
            };

            _obs.forEach( ob => {
                ob.subscribe( observer );
            } );
        },
        addObservable: ob => void _obs.push( ob ),
        addSubscription: sub => void _subs.push( sub ),
        get active(): boolean {
            return _active;
        }
    };
};
