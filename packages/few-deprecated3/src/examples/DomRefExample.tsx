import { defineComponent } from '@/vDom';

const DomRefComponent = defineComponent( {
    name: 'DomRefComponent',
    view: ( { ref } ): JSX.Element =>
        <div ref={ref( 'el' )}></div>,
    init: () => ( {} ),
    actions: {
        createDomComponent: ( { ref } ): void => {
            ref.el.innerHTML = '<code>This is a DOM component</code>';
        }
    },
    mount: ( { createDomComponent } ) => createDomComponent()
}  );

export default DomRefComponent;
