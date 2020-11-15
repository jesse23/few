import { defineComponent } from '@/vDom';

export default defineComponent( {
    name: 'SyncActionExample',
    init: () => ( {
        value: 7
    } ),
    // elm style of update
    actions: {
        plusOne: ( { value, dispatch } ) => void dispatch( { path: 'value', value: value + 1 } )
    },
    view: ( { value, plusOne } ) =>
        <div>
            <div>current number: {value}</div>
            {/*
                https://github.com/apollographql/react-apollo/issues/1841
                h function has loose signature as Function, which doesn't have issue above
            */}
            <button onClick={plusOne}>+1</button>
        </div>
} );
