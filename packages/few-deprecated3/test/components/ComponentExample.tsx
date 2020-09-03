import { h } from '@/vDom';
import { defineComponent } from '@/utils';

// object way - react has similar approach in createReactClass
// https://zh-hans.reactjs.org/docs/react-without-es6.html
//
// https://stackoverflow.com/questions/52992932/component-definition-is-missing-display-name-react-display-name
// method below is not for assign but mainly for skip the display-name check :)
const ObjectComponent = defineComponent( {
    name: 'ObjectComponent',
    render: ( { name }: { name: string } ): JSX.Element => <div>Hello { name || 'dummy' }</div>
} );

export default ObjectComponent;

/*
const Var =  {
    name: 'Var',
    init: ( { props } ) => ( {
        val: props.initVal
    } ),
    actions: {
        plusOne: ( { model, dispatch } ) => void
            dispatch( { path: 'val', value: model.val as number + 1 } ),
        minusOne: ( { model, dispatch } ) => void
            dispatch( { path: 'val', value: model.val as number - 1 } )
    },
    render: ( { name, val, plusOne, minusOne } ): JSX.Element =>
        <div>
            {name}: {val}
            <button onClick={() => void ( plusOne as Function )()}>+</button>
            <button onClick={() => void ( minusOne as Function )()}>-</button>
        </div>
};
*/
