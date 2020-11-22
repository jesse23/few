import { Observable, Observer } from './types';
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
        }
    };
};
