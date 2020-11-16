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
}

export interface Observable {
    subscribe: ( proc: Observer ) => void;
    unsubscribe: ( proc: Observer ) => void;
}

export interface Profiler {
    addObservable: ( ob: Observable ) => void;
    profile: () => Promise<number>;
    readonly state: STATE;
    readonly active: boolean;
}

export interface LegacyBrowserWindow {
    WebKitMutationObserver?: typeof MutationObserver;
    MozMutationObserver?: typeof MutationObserver;
}
