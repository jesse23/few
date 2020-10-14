import { defineComponent } from '@/utils';

const MyButton = defineComponent( {
    name: 'MyButton',
    view: ( { children } ) =>
        <button>
            {children}
        </button>
} );

export default defineComponent( {
    name: 'SlotExample',
    init: () => ( {
        val1: 'val1'
    } ),
    // h( 'div', null, 'current number: ', model.name ) is working too, but
    // it is not friendly for jsbeautify
    // https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking
    view: model =>
        <MyButton>
            <div>{model.val1}</div>
            <div>div2</div>
        </MyButton>
} );
