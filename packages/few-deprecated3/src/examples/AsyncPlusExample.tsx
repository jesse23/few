import {
    defineComponent,
    wait
} from '@/utils';

export default defineComponent( {
    name: 'AsyncActionExample',
    init: () => ( {
        value: 7
    } ),
    actions: {
        plusOneSync: ( { value, dispatch } ) =>
            void dispatch( { path: 'value', value: value + 1 } ),
        plusOneAsync: async( { value, dispatch } ) => void (
            await wait( 1000 ),
            dispatch( { path: 'value', value: ++value } )
        ),
        plusOneSyncAsync: async( { value, dispatch } ) => void (
            dispatch( { path: 'value', value: ++value } ),
            await wait( 1000 ),
            dispatch( { path: 'value', value: ++value } )
        )
    },
    view: ( { value, plusOneSync, plusOneAsync, plusOneSyncAsync } ): JSX.Element =>
        <div>
            <div id='value'>{value}</div>
            <button id='plusOneSync' onClick={plusOneSync}>+1 in Sync</button>
            <button id='plusOneAsync' onClick={plusOneAsync}>+1 in Async</button>
            <button id='plusOneAsync' onClick={plusOneSyncAsync}>+1 in Sync, then +1 in Async</button>
        </div>
} );
