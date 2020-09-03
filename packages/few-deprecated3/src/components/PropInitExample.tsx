import { defineComponent } from '../../src/utils';

const PositionComponent = defineComponent( {
    name: 'PositionComponent',
    init: ( { x, y }: { x: number; y: number } ) => ( {
        x,
        y,
        sum: x + y
    } ),
    render: ( model ): JSX.Element =>
        <div>X: {model.x}, Y: {model.y}, Sum: {model.sum}</div>
} );

/*
export default defineComponent( {
    name: 'PropInitExample',
    view: h => (): JSX.Element =>
        <PositionComponent x={3} y={4} />
} );
*/

