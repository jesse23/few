import { defineComponent } from '@/utils';

const PositionComponent = defineComponent( {
    name: 'PositionComponent',
    init: ( { x, y }: { x: number; y: number} ) => ( {
        x, y
    } ),
    view: ( { x, y } ): JSX.Element =>
        <div>X: {x}, Y: {y}</div>
} );

export default defineComponent( {
    name: 'PropInitExample',
    view: (): JSX.Element => <PositionComponent x={3} y={4} />
} );
