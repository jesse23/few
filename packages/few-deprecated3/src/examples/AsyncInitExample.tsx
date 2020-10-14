import {
    defineComponent,
    wait
} from '@/utils';

export default defineComponent( {
    name: 'AsyncInitExample',
    // elm returns model and cmd ( call back which will launch dispatch )
    init: () => wait( 1000 ).then( () => ( {
        asyncVal: 'async value'
    } ) ),
    view: ( { asyncVal } ) =>
        <pre>
            asyncVal: {`"${asyncVal}"`}
        </pre>
} );
