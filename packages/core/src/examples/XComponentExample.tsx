import type { RenderFunction, Props } from '@/types';
import { defineComponent } from '@/vDom';

const Var = defineComponent<{
    name: string;
    initVal: number;
    currVal?: number;
    onChange?: Function;
}>( {
    name: 'Var',
    init: ( { initVal } ) => ( {
        val: initVal
    } ),
    watchers: ( { updateValue, currVal } ) => [ {
        watch: currVal,
        action: updateValue
    } ],
    actions: {
        updateValue: ( { dispatch, currVal } ) => void
            ( currVal !== undefined && dispatch( { path: 'val', value: currVal } ) )
    },
    view: ( { name, val, dispatch, onChange } ): JSX.Element =>
        <div>
            {name}: {val}
            <button onClick={() => void
                ( dispatch( { path: 'val', value: val as number + 1 } ), onChange && onChange( val ) )
            }>+</button>
            <button onClick={() => void
                ( dispatch( { path: 'val', value: val as number - 1 } ), onChange && onChange( val ) )
            }>-</button>
        </div>
} );

const Position = defineComponent<{
    name: string;
    initX: number;
    initY: number;
    currY?: number;
    onChange?: Function;
}>( {
    name: 'Position',
    view: ( { name, initX, initY, onChange, currY } ): JSX.Element =>
        <>
            <h4>{name}</h4>
            <Var name='x' initVal={initX} />
            <Var name='y' initVal={initY} onChange={onChange} currVal={currY} />
        </>
} );

// Non-HOC solution
// primary here is not HOC yet but just a inline function to return h
// - inline function will not impact vDOM compare but will just getting executed directly
// - The result of HOC wll be used as a component, and will be involve in vDOM Compare
const Link = defineComponent<{
    forwardFn?: Function;
    backwardFn?: Function;
    children: [ RenderFunction<Props>, RenderFunction<Props> ];
}>( {
    name: 'Link',
    init: () => ( {} ),
    view: ( { children: [ primary, secondary ], forwardFn, backwardFn, forward, backward, dispatch } ): JSX.Element =>
        <>
            {primary( {
                currY: backward,
                onChange: ( v: number ): void => forwardFn && dispatch( { path: 'forward', value: forwardFn( v ) } )
            } )}
            {secondary( {
                currY: forward,
                onChange: ( v: number ): void => backwardFn && dispatch( { path: 'backward', value: backwardFn( v ) } )
            } )}
        </>
} );

export default defineComponent( {
    name: 'XComponentExample',
    view: (): JSX.Element =>
        <>
            <Link forwardFn={( y: number ): number => y + 1} backwardFn={( y: number ): number => y - 1}>
                {( rel ): JSX.Element => <Position name='Point A' initX={1} initY={2} {...rel} />}
                {( rel ): JSX.Element => <Position name='Point B' initX={3} initY={4} {...rel} />}
            </Link>
            <Position name='Point C (Isolated)' initX={5} initY={6} />
        </>
} );

/*
// HOC Solution
const Link = defineComponent( {
    name: 'Link',
    view: h => ( { props: { children: [ Primary, Secondary ], forwardFn, backwardFn }, model, dispatch } ): JSX.Element =>
        <>
            <Primary currY={model.backward}
                onChange={( v: number ): void => forwardFn && dispatch( { path: 'forward', value: forwardFn( v ) } )
            } />
            <Secondary currY={model.forward}
                onChange={( v: number ): void => backwardFn && dispatch( { path: 'backward', value: backwardFn( v ) } )
            } />
        </>
} );

// useCallback here is required for making the vDOM compare Stable in HOC solution. (Although it will work in this case
// without it )
// If the props are changed, it will still 're-render' but the state will remain if 'Component' is stable
// So if The result of HOC is pure component, HOC itself does not have too much value
// What if the children() has useState? I guess it will make the state belongs to parent component (Link here)
export default defineComponent( {
    name: 'XComponentExample',
    view: h => (): JSX.Element =>
        <>
            <Link forwardFn={( y: number ): number => y + 1} backwardFn={( y: number ): number => y - 1}>
                {useCallback( ( rel: Props ): JSX.Element => <Position name='Point A' initX={1} initY={2} {...rel} />, [] )}
                {useCallback( ( rel: Props ): JSX.Element => <Position name='Point B' initX={3} initY={4} {...rel} />, [] )}
            </Link>
            <Position name='Point C (Isolated)' initX={5} initY={6} />
        </>
} );
*/
