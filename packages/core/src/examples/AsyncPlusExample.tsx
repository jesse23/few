import { defineComponent } from '@/vDom';
import { wait } from '@/utils';

export default defineComponent( {
    name: 'AsyncPlusExample',
    init: () => ( {
        value: 7
    } ),
    actions: {
        plusOneSync: ( { value, dispatch } ) => void
            dispatch( { path: 'value', value: value + 1 } ),
        plusTwoSync: ( { plusOneSync } ) => void (
            plusOneSync(),
            plusOneSync()
        ),
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
    view: ( { value, plusOneSync, plusOneAsync, plusOneSyncAsync, plusTwoSync } ) =>
        <div>
            <div id='value'>{value}</div>
            <button id='plusOneSync' onClick={plusOneSync}>+1 in Sync</button>
            <button id='plusOneAsync' onClick={plusOneAsync}>+1 in Async</button>
            <button id='plusOneAsync' onClick={plusOneSyncAsync}>+1 in Sync, then +1 in Async</button>
            <button id='plusTwoSync' onClick={plusTwoSync}>+2 in Sync</button>
        </div>
} );
