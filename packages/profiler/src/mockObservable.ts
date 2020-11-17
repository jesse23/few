import { Observable, Observer } from './types';
interface MockObservable extends Observable {
    mockStart: () => void;
    mockDone:  () => void;
}

export const createMockObservable = (): MockObservable => {
    const _observers = [] as Observer[];
    return {
        mockStart: (): void => {
            _observers.forEach( ( observer: Observer ) => {
                observer.onStart();
            } );
        },
        mockDone: (): void => {
            _observers.forEach( ( observer: Observer ) => {
                observer.onDone();
            } );
        },
        subscribe: ( observer: Observer ): void => {
            _observers.push( observer );
        },
        unsubscribe: ( observer: Observer ): void => {
            _observers.push( observer );
        }
    };
};
