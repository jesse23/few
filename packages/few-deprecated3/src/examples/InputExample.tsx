import { defineComponent } from '@/utils';

export default defineComponent( {
    name: 'InputExample',
    init: () => ( {
        value: '',
        currNum: 7
    } ),
    actions: {
        reset: ( { dispatch } ) => void
            dispatch( { path: 'value', value: '' } )
    },
    view: ( { value, currNum, reset, dispatch } ) =>
        <>
            <div>
                <input id='text' value={value} onChange={ e => void
                    dispatch( { path: 'value', value: e.target.value } )
                } />
                <button id='reset' onClick={reset}>reset</button>
                <code id='data'>{value}</code>
            </div>
            <div id='plusPanel'>
                <div>{currNum}</div>
                <button id='plus' onClick={ () => void
                    dispatch( { path: 'currNum', value: currNum  + 1 } )
                }>+1</button>
            </div>
        </>
} );
