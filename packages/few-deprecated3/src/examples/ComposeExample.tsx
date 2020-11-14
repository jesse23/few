import { defineComponent } from '@/vDom';
import {
    mapDispatch
} from '@/utils';

interface VarProps {
    name: string;
    initVal: number;
}

const Var = defineComponent<VarProps>( {
    name: 'Var',
    init: ( { initVal } ) => ( {
        val: initVal
    } ),
    actions: {
        plusOne: ( { dispatch, val } ) => void
            dispatch( { path: 'val', value: val + 1 } ),
        minusOne: ( { dispatch, val } ) => void
            dispatch( { path: 'val', value: val - 1 } )
    },
    view: ( { name, val, plusOne, minusOne } ): JSX.Element =>
        <div>
            {name}: {val}
            <button onClick={() => void ( plusOne as Function )()}>+</button>
            <button onClick={() => void ( minusOne as Function )()}>-</button>
        </div>
} );

const Position = defineComponent<{
    name: string;
    initX: number;
    initY: number;
}>( {
    name: 'Position',
    view: ( { name, initX, initY } ): JSX.Element =>
        <>
            <h4>{name}</h4>
            <Var name='x' initVal={initX} />
            <Var name='y' initVal={initY} />
        </>
} );

const ComposePosition = defineComponent<{
    name: string;
    initX: number;
    initY: number;
}>( {
    name: 'ComposePosition',
    init: ( { initX, initY } ) => ( {
        varX: {
            ...Var.init( { initVal: initX } as VarProps ),
            name: 'x'
        },
        varY: {
            ...Var.init( { initVal: initY } as VarProps ),
            name: 'y'
        }
    } ),
    actions: {
        plusOne: ( { dispatch, ...model }, key ): void => Var.actions.plusOne( {
            ...model[key],
            dispatch: mapDispatch( dispatch, key )
        } ),
        minusOne: ( { dispatch, ...model }, key ): void => Var.actions.minusOne( {
            ...model[key],
            dispatch: mapDispatch( dispatch, key )
        } )
        /*
        plusX: ( { model, dispatch } ): void => Var.actions.plusOne( {
            model: model.varX as Model,
            dispatch: mapDispatch( dispatch, 'varX' )
        } ),
        plusY: ( { model, dispatch } ): void => Var.actions.plusOne( {
            model: model.varY as Model,
            dispatch: mapDispatch( dispatch, 'varY' )
        } ),
        minusX: ( { model, dispatch } ): void => Var.actions.minusOne( {
            model: model.varX as Model,
            dispatch: mapDispatch( dispatch, 'varX' )
        } ),
        minusY: ( { model, dispatch } ): void => Var.actions.minusOne( {
            model: model.varY as Model,
            dispatch: mapDispatch( dispatch, 'varY' )
        } )
        */
    },
    view: ( { name, varX, varY, plusOne, minusOne } ): JSX.Element =>
        <>
            <h4>{name}</h4>
            {/* ( { name, val, dispatch, plusOne } ) */}
            {Var.view( {
                ...varX,
                plusOne: () => plusOne( 'varX' ),
                minusOne: () => minusOne( 'varX' )
            } )}
            {Var.view( {
                ...varY,
                plusOne: () => plusOne( 'varY' ),
                minusOne: () => minusOne( 'varY' )
            } )}
        </>
} );

export default defineComponent( {
    name: 'ComposeExample',
    view: (): JSX.Element =>
        <>
            <Position name='Position' initX={1} initY={2} />
            <ComposePosition name='ComposePosition' initX={3} initY={4} />
        </>
} );
