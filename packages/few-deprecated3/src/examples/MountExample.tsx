import {
    defineComponent,
    wait
} from '@/utils';

export default defineComponent( {
    name: 'MountExample',
    // elm returns model and cmd ( call back which will launch dispatch )
    init: () => wait( 500 ).then( () => ( {
        mountVal: 'initVal'
    } ) ),
    mount: async( { dispatch } ) => {
        await wait( 500 );
        dispatch( { path: 'mountVal', value: 'mountVal' } );
    },
    /*
    unmount: ( { model: { id } } ) => {
        console.log( id );
    },
    */
    view: model =>
        <pre>
            {JSON.stringify( model )}
        </pre>
} );
