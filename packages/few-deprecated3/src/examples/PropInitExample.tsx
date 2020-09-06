import { defineComponent } from '@/utils';

const PositionComponent = defineComponent( {
    name: 'PositionComponent',
    init: ( { x, y }: { x: number; y: number} ) => ( {
        x: 9,
        sum: x + y
    } ),
    view: ( { x, y, sum } ): JSX.Element =>
        <div>X: {x}, Y: {y}, X+Y: {sum}</div>
} );

export default defineComponent( {
    name: 'PropInitExample',
    view: (): JSX.Element => <PositionComponent x={3} y={4} />
} );
