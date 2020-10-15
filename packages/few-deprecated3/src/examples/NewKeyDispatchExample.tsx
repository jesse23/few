import { defineComponent } from '@/utils';
import { h } from '@/vDom';

export default defineComponent( {
    name: 'NewKeyDispatchExample',
    // h( 'div', null, 'current number: ', model.name ) is working too
    view: ( { name, dispatch } ) =>
        h( 'div', null,
            h( 'div', null,
                'Hello ',
                name,
                '!'
            ),
            h( 'button', {
                onClick: () => dispatch( { path: 'name', value: 'Monster Hunter' } )
            },
                'set name'
            )
        ),
    // the name key doesn't exist in init data
    init: () => ( {} )
} );
