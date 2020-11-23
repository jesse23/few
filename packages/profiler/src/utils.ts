/**
 * Get current timestamp
 *
 * @returns current timestamp as number
 */
export const now = (): number => {
    if ( window && window.performance ) {
        return window.performance.now();
    }
    return Date.now();
};

const enabled = (): boolean => true;

const _observers = [] as any[];

/**
 * override JS API
 *
 * @param thisArg Explicit passing 'this' objet
 * @param fn actual function
 * @param name function name ( if any )
 * @returns function wrapped with observers
 */
export const override = <T>( thisArg: any, fn: T, name?: string ): T => {
    return ( function _profilerWrapperFn( ...args: any[] ) {
        if( !fn || !( fn as unknown as Function ).apply ) {
            return undefined;
        }

        if( enabled() && _observers.length > 0 ) {
            // const startTime = window.performance.now();

            try {
                _observers.forEach( o => {
                    o.onStart();
                } );
            } catch( ex ) {
                // do nothing...but we can also error out
            }

            const res = ( fn as unknown as Function ).apply( thisArg, args );

            // const endTime = window.performance.now();

            try {
                _observers.forEach( o => {
                    o.onDone();
                } );
            } catch( ex ) {
                // do nothing...but we can also error out
            }

            return res;
        }
        return ( fn as unknown as Function ).apply( thisArg, args );
    } ) as unknown as T;
};
