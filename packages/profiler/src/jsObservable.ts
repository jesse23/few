import { override } from '@/utils';

/**
 * origin setTimeout call
 */
const _globalSetTimeout = setTimeout;

/**
 * document.head.appendChild
 */
const _documentHeadAppendChild = document.head.appendChild;

/**
 * event listener - in IE EventTarget could be Element
 */
const _addEventListener = EventTarget.prototype.addEventListener;
const _removeEventListener = EventTarget.prototype.removeEventListener;

const enabled = (): boolean => true;

const _observers: any[] = [];

export const install = (): void => {
    if ( !enabled() ) {
        window.setTimeout = ( function( ...args: any[] ): any {
            const fn = args[0];
            args[0] = override( null, fn );
            // eslint-disable-next-line no-invalid-this
            return _globalSetTimeout.apply( this, ...args );
        } ) as typeof setTimeout;

        // webpack will use document.head.appendChild to load JS script
        document.head.appendChild = ( ...args: any[] ): any => {
            if ( enabled() && _observers.length > 0 ) {
                const elem = args[0];

                // only test script tag which has onload
                if ( elem.tagName === 'SCRIPT' && elem.src && elem.onload ) {
                    const _origOnLoadFn = elem.onload;
                    const _origOnErrorFn = elem.onerror || ( (): void => void null );

                    elem.onload = ( ...args: any[] ): unknown => {
                        if ( enabled() && _observers.length > 0 ) {
                            // const startTime = window.performance.now();
                            // console.log( `onload: ${elem.src}`)
                            const res = _origOnLoadFn( ...args );
                            // const endTime = window.performance.now();

                            try {
                                _observers.forEach( o => {
                                    o.onDone();
                                } );
                            } catch ( ex ) {
                                // do nothing...but we can also error out
                            }
                            return res;
                        }
                        return _origOnLoadFn( ...args );
                    };

                    elem.onerror = ( ...args: any[] ): unknown => {
                        if ( enabled() && _observers.length > 0 ) {
                            // const startTime = window.performance.now();
                            // console.log( `onerror: ${elem.src}`)
                            const res = _origOnErrorFn( ...args );
                            // const endTime = window.performance.now();

                            try {
                                _observers.forEach( o => {
                                    o.onDone();
                                } );
                            } catch ( ex ) {
                                // do nothing...but we can also error out
                            }
                            return res;
                        }
                        return _origOnErrorFn( ...args );
                    };

                    try {
                        _observers.forEach( o => {
                            o.onStart();
                        } );
                    } catch ( ex ) {
                        // do nothing...but we can also error out
                    }

                    // console.log( `append script: ${elem.src}`);
                    return _documentHeadAppendChild.apply( document.head, args );
                }
                return _documentHeadAppendChild.apply( document.head, args );
            }
        };

        const _evtMap = new Map();

        // hook event listener
        EventTarget.prototype.addEventListener = function( ...args ): void {
            const fn = args[1];
            const overrideFn = override( null, fn );
            args[1] = overrideFn;
            _evtMap.set( fn, overrideFn );
            _addEventListener.apply( this, args );
        };

        EventTarget.prototype.removeEventListener = function( ...args ): void {
            const fn = args[1];
            const overrideFn = _evtMap.get( fn );
            args[1] = overrideFn;
            _removeEventListener.apply( this, args );
        };
        // _enabled = true
    }
};

export const uninstall = (): void => {
    window.setTimeout = _globalSetTimeout;
    document.head.appendChild = _documentHeadAppendChild;
    EventTarget.prototype.addEventListener = _addEventListener;
    EventTarget.prototype.removeEventListener = _removeEventListener;
};
