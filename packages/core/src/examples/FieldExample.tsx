import type { Props, Primitive } from '@/types';
import { defineComponent } from '@/vDom';
import { getInputValue } from '@/utils';
import './FieldExample.scss';


export interface Field {
    name: string;
    type: 'number' | 'string' | 'boolean';
    check?: ( value: string ) => string;
    required?: boolean;
    value?: Primitive;
}

const mapFieldToInput = ( type: string, value: Primitive ): Props => {
    switch ( type ) {
        case 'number':
            return {
                type: 'number',
                value: value || ''
            };
        case 'boolean':
            return {
                type: 'checkbox',
                checked: value || false
            };
        case 'string':
        default:
            return {
                type: 'text',
                value: value || ''
            };
    }
};

export const Field = defineComponent( {
    name: 'Field',
    init: ( { field } ) => ( {
        value: field.value
    } ),
    actions: {
        reset: ( { dispatch, field } ) => void
            dispatch( { path: 'value', value: field.value } )
    },
    watchers: ( { field, reset } ) => [
        {
            watch: field,
            action: reset
        }
    ],
    view: ( { id, field, onChange, value, dispatch } ): JSX.Element =>
        <div>
            <label htmlFor={id}>{field.name}{field.required ? '*' : ''}: </label>
            <input id={id} name={id} {...mapFieldToInput( field.type, value as Primitive )} onChange={e => void
                ( dispatch( { path: 'value', value: getInputValue( e.target ) } ), onChange && onChange( e ) )
            } required={field.required} />
            {field.required ?
                <span className='validity'></span> :
                <code style={{ color: 'red' }}>{field.check && field.check( value )}</code>
            }
        </div>
} );


export default defineComponent( {
    name: 'FieldExample',
    init: () => ( {
        currNum: 7,
        field: {
            name: 'age',
            type: 'number',
            check: ( v ): string => v || v === undefined ? '' : 'cannot be empty'
        } as Field
    } ),
    actions: {
        reset: ( { field, dispatch } ) => void
            dispatch( { path: 'field', value: { ...field } } )
    },
    view: ( { field, currNum, reset, dispatch } ): JSX.Element =>
        <>
            <div>
                <Field id='age' field={field as Field}></Field>
                <button id='reset' onClick={reset}>reset</button>
            </div>
            <div id='plusPanel'>
                <div>{currNum}</div>
                <button id='plus' onClick={() => void
                    dispatch( { path: 'currNum', value: currNum + 1 } )
                }>+1</button>
            </div>
        </>
} );
