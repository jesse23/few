export const enum STATE {
    IDLE = 0,
    HOLD = 1,
    WAIT = 2,
    DONE = 3
}

export interface Observer {
    onStart: () => void;
    onDone: () => void;
    onComplete: () => void;
    onTimeout: () => void;
}

/**
 * Two types of 'observables':
 *
 * - observable is global, like XHR, setTimeout, MutationObserver
 *   - When profile start, we add observer (which is just a runtime instance created at the
 *     beginning) to observable.
 *   - When profile is completed, we remove observer from observable
 *
 * - observable is created in ad-hoc, for example we create new GlobalMutationObserver for
 *   each profile. MutationObserver can be implemented by this way too.
 *   - When profile start, we 'create' observable and add observer to it?
 *   - When profile is done, just destroy the observable correctly
 *
 * - No matter which practice, keep the lifecycle of observable and observer to be independent
 *   will be the best practice.
 */
export interface Observable {
    /**
     * subscribe to an observer
     * @param proc observer instance
     */
    subscribe: ( proc: Observer ) => void;

    /**
     * unsubscribe to an observer
     * @param proc observer instance
     */
    unsubscribe: ( proc: Observer ) => void;
}

export interface Profiler {
    addObservable: ( ob: Observable ) => void;
    profile: () => Promise<number>;
    readonly state: STATE;
    readonly active: boolean;
}

export interface Options {
    interval?: number;
    maxWait?: number;
}

export interface LegacyBrowserWindow {
    WebKitMutationObserver?: typeof MutationObserver;
    MozMutationObserver?: typeof MutationObserver;
}
