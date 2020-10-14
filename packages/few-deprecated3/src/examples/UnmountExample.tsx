import {
    defineComponent,
    wait
} from '@/utils';

export const mockServer = {
    _server: {} as { [key: string]: string },
    register: async( name: string ): Promise<string> => {
        const id = `GOT_${name}`;
        await wait( 1000 );
        mockServer._server[id] = name;
        return id;
    },
    unregister: ( id: string ): void => void delete mockServer._server[id]
};

const UnmountActionComponent = defineComponent( {
    name: 'UnmountActionComponent',
    // elm returns model and cmd ( call back which will launch dispatch )
    init: async() => ( {
        id: await mockServer.register( 'john' )
    } ),
    unmount: ( { id } ) => {
        mockServer.unregister( id as string );
    },
    actions: {
        plusOne: ( { value, dispatch } ) => void
            dispatch( { path: 'value', value: value as number + 1 } )
    },
    view: ( { id } ) =>
        <pre>
            id: {id || 'loading...'}
        </pre>
} );

export default defineComponent( {
    name: 'UnmountExample',
    init: () => ( {
        enabled: true
    } ),
    actions: {
        toggle: ( { enabled, dispatch } ) => void dispatch( { path: 'enabled', value: !enabled } )
    },
    view: ( { enabled, toggle } ) =>
        <>
            { enabled ? <UnmountActionComponent /> : ''}
            <button id='toggleButton' onClick={toggle}>toggle</button>
        </>
} );


