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

const PositionComponent1 = defineComponent<{
    x: number;
    y: number;
}>( {
    name: 'PositionComponent',
    init: ( { x, y } ) => ( {
        x,
        y,
        sum: x + y
    } ),
    render: ( model ): JSX.Element =>
        <div>X: {model.x}, Y: {model.y}, Sum: {model.sum}</div>
} );

const example = defineComponent( {
    name: 'PropInitExample',
    render: ( { z }: { z: number } ): JSX.Element =>
        <PositionComponent x={3} y={4 + z} />
} );

const example1 = defineComponent<{ z: number }>( {
    name: 'PropInitExample',
    render: ( { z } ): JSX.Element =>
        <PositionComponent x={3} y={4 + z} />
} );

export default example;

