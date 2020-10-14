import { defineComponent } from '@/utils';

export default defineComponent( {
    name: 'FragmentExample',
    view: model =>
        <>
            <div>Hello </div>
            <div>{model.name}!</div>
        </>,
    init: () => ( {
        name: 'Monster Hunter'
    } )
} );
