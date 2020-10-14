import { defineComponent } from '@/utils';

export default defineComponent( {
    name: 'ViewExample',
    view: model =>
        <>
            <div>Hello </div>
            <div>{model.name}!</div>
        </>,
    init: () => ( {
        name: 'Monster Hunter'
    } )
} );
