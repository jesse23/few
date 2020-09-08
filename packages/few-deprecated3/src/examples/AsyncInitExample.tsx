import { defineComponent } from '@/utils';

/**
 * wait for elapsed time and return a promise
 * @param elapsed elapsed time
 * @returns promise
 */
export const wait = ( elapsed = 0 ): Promise<{}> =>
    new Promise( resolve => setTimeout( () => resolve( null ), elapsed ) );

export default defineComponent( {
    name: 'AsyncInitExample',
    // elm returns model and cmd ( call back which will launch dispatch )
    init: () => wait( 1000 ).then( () => ( {
        asyncVal: 'async value'
    } ) ),
    view: ( { asyncVal } ): JSX.Element =>
        <pre>
            asyncVal: {`"${asyncVal}"`}
        </pre>
} );
