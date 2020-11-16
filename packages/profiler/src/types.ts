export const enum STATE {
    IDLE = 0,
    HOLD = 1,
    WAIT = 2,
    DONE = 3
}

export interface Watcher {
    register: ( onStart: () => void, onDone: () => void ) => void;
    unregister: () => void;
}

export interface Profiler {
    addWatcher: ( watcher: Watcher ) => void;
    profile: () => Promise<number>;
    readonly state: STATE;
    readonly active: boolean;
}
