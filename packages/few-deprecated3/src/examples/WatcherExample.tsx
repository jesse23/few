import { defineComponent } from '@/utils';

const PropsDomWidget = defineComponent<{
    prop: {
        color: string;
    };
}>( {
    name: 'PropsDomWidget',
    view: ( { ref } ) =>
        <div ref={ref( 'el' )}></div>,
    init: () => ( {} ),
    watchers: ( { prop, createDomComponent, updateColor } ) => [ {
        watch: true,
        action: createDomComponent
    }, {
        watch: prop.color,
        action: updateColor
    } ],
    actions: {
        createDomComponent: ( { ref } ) => void
            ( ref.el.innerHTML = '<code>This is a DOM component</code>' ),
        updateColor: ( { ref, prop } ) => void
            ( ref.el.style.color = prop.color )
    }
} );

export default defineComponent( {
    name: 'PropsDomExample',
    view: ( { prop, switchColor } ) =>
        <div>
            <PropsDomWidget prop={prop} />
            <button id='switchColor' onClick={switchColor}>Switch Color</button>
        </div>,
    init: () => ( {
        prop: {
            color: 'green'
        },
        color: 'green'
    } ),
    actions: {
        switchColor: ( { prop, dispatch } ) => void
            dispatch( { path: 'prop.color',  value: prop.color === 'green' ? 'black' : 'green' } )
            /*
            Blow is working too but a different effect
            dispatch( 'prop', {
                ...prop,
                color: prop.color === 'green' ? 'black' : 'green'
            } );
            */
    }
} );
