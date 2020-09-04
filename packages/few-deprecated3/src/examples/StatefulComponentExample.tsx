import { h } from '@/vDom';
import { defineComponent } from '../../src/utils';

export default defineComponent( {
    name: 'StatefulComponent',
    init: () => ( {
        x: 3,
        y: 5
    } ),
    render: ( model ): JSX.Element =>
        <div>x: {model.x}, y: {model.y}</div>
} );
