import { Observer, LegacyBrowserWindow } from '@/types';

let _mutationObserver: any;
const _observers = [] as Observer[];

export const install = (): void => {
    // https://developer.mozilla.org/docs/Web/API/MutationObserver
    // - Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
    // have WebKitMutationObserver but not un-prefixed MutationObserver.
    // - Some browser doesn't have both.
    const GlobalMutationObserver = window.MutationObserver ||
        ( window as LegacyBrowserWindow ).WebKitMutationObserver ||
        ( window as LegacyBrowserWindow ).MozMutationObserver;

    if( GlobalMutationObserver ) {
        _mutationObserver = new GlobalMutationObserver( () => {
            _observers.forEach( ( observer ) => {
                observer.onStart();
                observer.onDone();
            } );
        } );

        const config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        };

        _mutationObserver.observe( document, config );
    }
};

export const uninstall = (): void => {
    if( _mutationObserver ) {
        _mutationObserver.disconnect();
    }
};

export const subscribe = ( observer: Observer ): void => {
    _observers.push( observer );
};

export const unsubscribe = ( observer: Observer ): void => {
    _observers.filter( ( o: Observer ) => o !== observer );
};
