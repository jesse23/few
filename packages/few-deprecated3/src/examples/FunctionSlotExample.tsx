import { defineComponent } from '@/utils';

const MyButton = defineComponent( {
    name: 'MyButton',
    view: ( { children: showVal } ) =>
        <button>
            {showVal( 'Hello' )}
        </button>
} );

export default defineComponent( {
    name: 'FunctionSlotExample',
    init: () => ( {
        val1: 'val1'
    } ),
    // h( 'div', null, 'current number: ', model.name ) is working too, but
    // it is not friendly for js-beautify
    // https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking
    view: model =>
        <MyButton>
            {( str: string ): JSX.Element => <div>{str} {model.val1}</div>}
        </MyButton>
} );
