import { h } from '@/vDom';
import { defineComponent } from '@/utils';

// object way - react has similar approach in createReactClass
// https://zh-hans.reactjs.org/docs/react-without-es6.html
//
// https://stackoverflow.com/questions/52992932/component-definition-is-missing-display-name-react-display-name
// method below is not for assign but mainly for skip the display-name check :)
export default defineComponent( {
    name: 'StatelessComponent',
    view: ( { name }: { name: string } ): JSX.Element => <div>Hello { name || 'dummy' }</div>
} );
