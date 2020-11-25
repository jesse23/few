import {
    Observable,
    Observer,
    Session,
    Subscription
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
export const createSession = ( profiler: any ): Session => {
    const _obs = [] as Observable[];

    const _subs: Subscription[] = [];

    const _profiler = profiler;

    let _active = false;

    let _promise: Promise<number>;

    return {
        enable: (): void => {
            _active = true;


            const observer = {
                onStart: async() => {
                    if ( !_promise ) {
                        /**
                         * - If session is not started, start it;
                         * - If session is started, since the same observable
                         *   will be part of the profilers observable, we don't
                         *   need a separate resetWait
                         */
                        _promise = _profiler.profile();
                        const _res = await _promise;

                        /*
                        _subs.forEach( sub => {
                            sub.onUpdate( _res );
                        } );
                        */

                        _promise = null;
                    }
                },
                onDone: () => {
                    console.log( 'onDone' );
                }
            } as Observer;

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
