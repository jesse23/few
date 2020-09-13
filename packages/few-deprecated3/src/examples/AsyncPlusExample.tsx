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
        plusOneAsync: async( { plusOneSync } ) => void (
            await wait( 4000 ),
            plusOneSync()
        ),
        plusOneSyncAsync: async( { plusOneSync } ) => void (
            plusOneSync(),
            await wait( 4000 ),
            plusOneSync()
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
