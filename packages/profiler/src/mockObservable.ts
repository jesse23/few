import { Observable, Observer } from '@/types';
import { now } from '@/profiler';
interface MockObservable extends Observable {
    mockStart: () => void;
    mockDone:  () => void;
}

export const createMockObservable = (): MockObservable => {
    let _observers = [] as Observer[];
    return {
        mockStart: (): void => {
            // DOM child node approach
            for( let i = 0; i < _observers.length; i++ ) {
                _observers[i].onStart();
            }
            /*
            _observers.forEach( ( observer: Observer ) => {
                observer.onStart();
            } );
            */
        },
        mockDone: (): void => {
            // DOM child node approach
            for( let i = 0; i < _observers.length; i++ ) {
                _observers[i].onDone( {
                    count: 1
                } );
            }
            /*
            _observers.forEach( ( observer: Observer ) => {
                observer.onDone();
            } );
            */
        },
        subscribe: ( observer: Observer ): void => {
            _observers.push( observer );
        },
        unsubscribe: ( observer: Observer ): void => {
            _observers = _observers.filter( ( o: Observer ) => o !== observer );
        }
    };
};

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
