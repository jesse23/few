import { h, defineComponent } from '@/vDom';

export default defineComponent( {
    name: 'ViewExample',
    view: model =>
        h( null, null,
            h( 'div', null, 'Hello ' ),
            h( 'div', null, model.name )
        ),
    init: () => ( {
        name: 'Monster Hunter'
    } )
} );
