import { Observable, Observer, Subscription } from './types';

/**
 * - listener, in one way, has no difference with `observable`.
 * - 'observable' might need to ability later to pass in the 'delta'
 *   input like rxjs, and leave the observer to proceed the value.
 */
class ClickListener implements Observable {
    private _observers: Observer[] = [];

    private _clickHandler(): void {
        this._observers.forEach( observer => {
            observer && observer.onStart();
            observer && observer.onDone();
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

    subscribe( observer: Observer ): Subscription {
        this._observers.push( observer );
        const id = this._observers.length - 1;
        return {
            unsubscribe: (): void => {
                this._observers[id] = null;
            }
        };
    }
}

// Try and ad-hoc practice, this is more likely an 'observer' rather than
// observable.
export const createDomEventObservable = (): Observable => {
    // ad-hoc practice, no need to use array
    let _observer: Observer;

    const _clickHandler = (): void => {
        if ( _observer ) {
            _observer && _observer.onStart();
            _observer && _observer.onDone();
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
        subscribe: ( observer: Observer ): Subscription => {
            _observer = observer;

            // ad-hoc practice, we can install it here
            // for real observable, we can't do that since
            // multiple observer might be subscribed to one
            // observable
            _install();

            return {
                unsubscribe: (): void => {
                    _observer = null;
                }
            };
        }
    };
};

export default ClickListener;
