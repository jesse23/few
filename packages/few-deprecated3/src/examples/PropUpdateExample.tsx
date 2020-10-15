import type {
    ActionHandler
} from '@/types';

import { defineComponent } from '@/utils';

interface Position {
    x: number;
    y: number;
}

const StatelessComponent = defineComponent<{
    position: Position;
    action: ActionHandler;
}>( {
    name: 'StatelessComponent',
    // init: () => ( {} ),
    view: ( { position, action } ) =>
        <>
            <div>X: {position.x}, Y: {position.y}</div>
            <button id='clickOnParent' onClick={action}>+1 in Stateless Component</button>
        </>
} );

const StatefulComponent = defineComponent<{
    position: Position;
}>( {
    name: 'StatefulComponent',
    init: ( { position } ) => ( {
        // immutable and mutable has different behavior here if use 'point: position'
        // - In vue it maybe an object wit reactivity/watcher, mutation on the data
        //   might cause side effect (parent component update)
        // - In react it is pure data, in most of case it will be safe when try to do
        //   immutable operation to data
        // The safest way is always put literal structure ( deep clone or spread ) to
        // make sure they are different copy between different 'store'
        point: { ...position }
    } ),
    actions: {
        moveForward: ( { point, dispatch } ) => void
            dispatch( { path: 'point.x', value: point.x + 1 } )
    },
    view: ( { point, moveForward } ) =>
        <>
            <div>X: {point.x}, Y: {point.y}</div>
            <button id='clickOnSub' onClick={moveForward}>+1 in Stateful Component</button>
        </>
} );

export default defineComponent( {
    name: 'PropByRefExample',
    init: () => ( {
        position: {
            x: 0,
            y: 0
        }
    } ),
    actions: {
        moveForward: ( { position, dispatch } ) => void
            dispatch( { path: 'position.x', value: position.x + 1 } )
    },
    view: ( { position, moveForward } ) =>
        <>
            <StatefulComponent position={position} />
            <StatelessComponent position={position} action={moveForward} />
        </>
} );

