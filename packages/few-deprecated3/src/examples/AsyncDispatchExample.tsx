import { defineComponent } from '@/vDom';

export default defineComponent( {
    name: 'AsyncDispatchExample',
    init: () => ( {} ),
    actions: {
        setValue1: ( { dispatch } ) => void dispatch( { path: 'value1', value: 'value1' } ),
        setValue2: ( { dispatch } ) => void dispatch( { path: 'value2', value: 'value2' } ),
        setValue3: ( { dispatch } ) => void setTimeout( () => dispatch( { path: 'value3', value: 'value3' } ), 3000 )
    },
    view: ( { value1, value2, value3, setValue1, setValue2, setValue3 } ) =>
        <div>
            <button id='button1' onClick={setValue1}>value1</button>
            <div id='value1'>{value1}</div>
            <button id='button2' onClick={setValue2}>value2</button>
            <div id='value2'>{value2}</div>
            <button id='button3' onClick={setValue3}>value3</button>
            <div id='value3'>{value3}</div>
        </div>
} );
