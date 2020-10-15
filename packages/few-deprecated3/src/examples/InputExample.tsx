import { defineComponent } from '@/utils';

export default defineComponent( {
    name: 'InputExample',
    init: () => ( {
        value: '',
        currNum: 7
    } ),
    actions: {
        changeValue: ( { dispatch }, e ) => void
            dispatch( { path: 'value', value: e.target.value } ),
        reset: ( { dispatch } ) => void
            dispatch( { path: 'value', value: '' } ),
        plusOne: ( { currNum, dispatch } ) => void
            dispatch( { path: 'currNum', value: currNum + 1 } )
    },
    view: ( { value, currNum, reset, changeValue, plusOne } ) =>
        <>
            <div>
                <input id='text' value={value} onChange={changeValue} />
                <button id='reset' onClick={reset}>reset</button>
                <code id='data'>{value}</code>
            </div>
            <div id='plusPanel'>
                <div>{currNum}</div>
                <button id='plus' onClick={plusOne}>+1</button>
            </div>
        </>
} );
