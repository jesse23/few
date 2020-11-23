import { override } from '@/utils';

/**
 * XHR API
 */
const _xhrOpen = XMLHttpRequest.prototype.open;
const _xhrSend = XMLHttpRequest.prototype.send;

/**
 * XHR event
 */
const _xhrEventListeners: { [key: string]: ( xhr: XMLHttpRequest ) => void } = {
    abort: xhr => console.log( `Abort: ${xhr}` ),
    error: xhr => console.log( `Error: ${xhr}` ),
    timeout: xhr => console.log( `Timeout: ${xhr}` )
};

const enabled = (): boolean => true;

const _observers: any[] = [];

let _counter = 0;


export const install = (): void => {
    if ( !enabled() ) {
        XMLHttpRequest.prototype.open = function( ...args: any[] ): any {
            _counter++;
            _xhrOpen.apply( this, args );

            // some browser doesn't use requestURL, set it here to get alignment
            this.requestURL = args[1];
        };

        XMLHttpRequest.prototype.send = function( body ): void {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const _xhrObj = this;
            _xhrObj.addEventListener( 'readystatechange', function() {
                if ( _xhrObj.readystate === 4 ) {
                    _counter -= 2;
                }

                /*
                // process response
                const responseSize = _xhrObj.response.length;
                const endTime = window.performance.now();
                const url = _xhrObj.responseURL || _xhrObj.requestURL || '';
                */

                try {
                    _observers.forEach( o => {
                        o.onDone();
                    } );
                } catch ( ex ) {
                    // do nothing...but we can also error out
                }
            } );

            if ( _xhrObj.onload ) {
                _xhrObj.onload = override( _xhrObj, _xhrObj.onload, _xhrObj.requestURL );
            }

            /*
            // process request
            const requestSize = body && ( body as string ).length ? ( body as string ).length : 0;
            let jsonData;
            try {
                jsonData = typeof body === 'string' ? JSON.parse( body ) : {};
            } catch ( ex ) {
                if ( !_xhrObj.requestURL.includes( 'socket.io' ) ) {
                    console.warn( 'XHR input is not in JSON format' );
                }
                jsonData = {};
            }
            */
            for ( const key in _xhrEventListeners ) {
                _xhrObj.addEventListener( key, () => _xhrEventListeners[key]( _xhrObj ) );
            }

            try {
                _observers.forEach( o => {
                    o.onStart();
                } );
            } catch ( ex ) {
                // do nothing...but we can also error out
            }

            _xhrSend.call( _xhrObj, body );
        };
        // _enable = true;
    }
};

export const uninstall = (): void => {
    XMLHttpRequest.prototype.open = _xhrOpen;
    XMLHttpRequest.prototype.send = _xhrSend;
};
