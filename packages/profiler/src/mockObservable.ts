import { Observer } from './types';

const _observers = [] as Observer[];

// mock start
export const start = (): void => {
    _observers.forEach( ( observer: Observer ) => {
        observer.onStart();
    } );
};

// mock done
export const done = (): void => {
    _observers.forEach( ( observer: Observer ) => {
        observer.onDone();
    } );
};

export const subscribe = ( observer: Observer ): void => {
    _observers.push( observer );
};

export const unsubscribe = ( observer: Observer ): void => {
    _observers.filter( ( o: Observer ) => o !== observer );
};
