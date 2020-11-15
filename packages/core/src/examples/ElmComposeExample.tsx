import { defineComponent, h } from '@/vDom';
import { mapDispatch } from '@/utils';

const Counter = defineComponent( {
    name: 'Counter',
    init: () => ( {
        val: 3
    } ),
    actions: {
        plusOne: ( { dispatch, val } ) => void
            dispatch( { path: 'val', value: val + 1 } ),
        minusOne: ( { dispatch, val } ) => void
            dispatch( { path: 'val', value: val - 1 } )
    },
    view: ( { val, plusOne, minusOne } ): JSX.Element =>
        <div>
            {val}
            <button onClick={plusOne}>+</button>
            <button onClick={minusOne}>-</button>
        </div>
} );

export default defineComponent( {
    name: 'CounterGroup',
    init: () => ( {
        uid: 0,
        counters: []
    } ),
    actions: {
        // local msg
        insert: ( { dispatch, counters, uid } ): void => {
            dispatch( {
                path: 'counters',
                value: counters.concat( [ {
                    id: uid,
                    counter: Counter.init()
                } ] )
            } );
            dispatch( {
                path: 'uid',
                value: uid++
            } );
        },
        remove: ( { dispatch, counters, uid } ): void => {
            dispatch( {
                path: 'counters',
                value: ( counters.splice( -1, 1 ), counters )
            } );
            dispatch( {
                path: 'uid',
                value: uid--
            } );
        },
        plus: ( { dispatch, counters }, idx ): void => {
            Counter.actions.plusOne( {
                ...counters[idx].counter,
                dispatch: mapDispatch( dispatch, `counters[${idx}].counter` )
            } );
        },
        minus: ( { dispatch, counters }, idx ): void => {
            Counter.actions.minusOne( {
                ...counters[idx].counter,
                dispatch: mapDispatch( dispatch, `counters[${idx}].counter` )
            } );
        }
    },
    view: ( { counters, insert, remove, plus, minus } ): JSX.Element =>
        <>
            <button onClick={insert}>Insert</button>
            <button onClick={remove}>Remove</button>
            {counters.map( ( m, idx ) =>
                h( null, { key: idx }, Counter.view( {
                    ...m.counter,
                    plusOne: () => plus( idx ),
                    minusOne: () => minus( idx )
                } ) )
            )}
        </>
} );
