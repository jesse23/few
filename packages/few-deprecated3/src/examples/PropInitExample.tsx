import { defineComponent } from '../../src/utils';

const PositionComponent = defineComponent( {
    name: 'PositionComponent',
    init: ( { props } ) => ( {
        ...props
    } ),
    view: ( { model } ): JSX.Element =>
        <div>X: {model.x}, Y: {model.y}</div>
} );

export default defineComponent( {
    name: 'PropInitExample',
    view: (): JSX.Element =>
        <PositionComponent x={3} y={4} />
} );
