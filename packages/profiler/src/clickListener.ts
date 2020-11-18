import { Observable, Observer } from './types';

/**
 * - listener, in one way, has no difference with `observable`.
 * - 'observable' might need to ability later to pass in the 'delta'
 *   input like rxjs, and leave the observer to proceed the value.
 */
class ClickListener implements Observable {
    private _observers: Observer[] = [];

    private _clickHandler(): void {
        this._observers.forEach( observer => {
            observer.onStart();
            observer.onDone();
        } );
    }

    public constructor() {
        this._observers = [];
    }

    install(): void {
        document.addEventListener( 'click', () => this._clickHandler() );
        document.addEventListener( 'mousedown', () => this._clickHandler() );
    }

    uninstall(): void {
        document.removeEventListener( 'click', () => this._clickHandler() );
        document.removeEventListener( 'mousedown', () => this._clickHandler() );
    }

    subscribe( observer: Observer ): void {
        this._observers.push( observer );
    }

    unsubscribe( observer: Observer ): void {
        this._observers.filter( ( o: Observer ) => o !== observer );
    }
}

// Try and ad-hoc practice, this is more likely an 'observer' rather than
// observable.
export const createDomEventObservable = (): Observable => {
    // ad-hoc practice, no need to use array
    let _observer: Observer;

    const _clickHandler = (): void => {
        if ( _observer ) {
            _observer.onStart();
            _observer.onDone();
        }
    };

    const _install = (): void => {
        document.addEventListener( 'click', _clickHandler );
        document.addEventListener( 'mousedown', _clickHandler );
    };

    const _uninstall = (): void => {
        document.removeEventListener( 'click', _clickHandler );
        document.removeEventListener( 'mousedown', _clickHandler );
    };

    return {
        subscribe: ( observer: Observer ): void => {
            _observer = observer;

            // ad-hoc practice, we can install it here
            // for real observable, we can't do that since
            // multiple observer might be subscribed to one
            // observable
            _install();
        },
        unsubscribe: ( /*observer: Observer*/ ): void => {
            _observer = null;

            // ad-hoc practice, we can uninstall it here
            _uninstall();
        }
    };
};

export default ClickListener;
