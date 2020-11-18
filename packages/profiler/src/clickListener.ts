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

export default ClickListener;
