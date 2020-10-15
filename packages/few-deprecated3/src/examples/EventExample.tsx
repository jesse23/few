import { defineComponent } from '@/utils';

export const printStack = [] as string[];

const ChildComponent = defineComponent( {
    name: 'ChildComponent',
    init: () => ( {} ),
    view: ( { ref, handleClick } ) =>
        <button id='button' ref={ref( 'el' )} onClick={handleClick}>click me!</button>,
    mount: ( { ref } ) => {
        ref.el.addEventListener( 'click', () => {
            printStack.push( 'Native click event for ChildComponent.' );
        } );
    },
    actions: {
        handleClick: (): void => {
            printStack.push( 'Framework click event for ChildComponent.' );
        }
    }
} );

const ParentComponent = defineComponent( {
    name: 'ParentComponent',
    init: () => ( {} ),
    view: ( { ref, handleClick } ) =>
        <div ref={ref( 'el' )} onClick={handleClick}>
            <ChildComponent />
        </div>,
    mount: ( { ref } ) => {
        ref.el.addEventListener( 'click', () => {
            printStack.push( 'Native click event for ParentComponent.' );
        } );
    },
    actions: {
        handleClick: (): void => {
            printStack.push( 'Framework click event for ParentComponent.' );
        }
    }
} );

export default defineComponent( {
    name: 'EventExample',
    init: () => ( {} ),
    view: ( { ref, handleClick } ) =>
        <div ref={ref( 'el' )} onClick={handleClick}>
            <ParentComponent />
        </div>,
    mount: ( { ref } ) => {
        ref.el.addEventListener( 'click', () => {
            printStack.push( 'Native click event for EventExample.' );
        } );
    },
    actions: {
        handleClick: (): void => {
            printStack.push( 'Framework click event for EventExample.' );
        }
    }
} );
