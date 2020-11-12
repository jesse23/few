import type { User } from '@/examples/FormExample';
import { defineComponent } from '@/vDom';
import { wait } from '@/utils';
import { UserForm } from '@/examples/FormExample';

// mock server
const mockServer = {
    _currUser: {
        name: 'John',
        age: 29,
        isAdmin: true
    } as User,
    getCurrUser: async(): Promise<User> => ( ( await wait( 500 ), mockServer._currUser ) ),
    updateCurrUser: async( updateValues: User ): Promise<void> => void ( ( await wait( 500 ), Object.assign( mockServer._currUser, updateValues ) ) )
};

// example
export default defineComponent( {
    name: 'FormEditExample',
    init: () => ( {
        editing: false
    } ),
    view: ( { currUser, editing, loadUser, toggleEdit, saveEdit } ): JSX.Element =>
        <>
            <pre>Current User: {JSON.stringify( currUser, null, 2 ) || 'Not Loaded'}</pre>
            <button onClick={loadUser} disabled={editing as boolean}>Load</button>
            <button onClick={toggleEdit} disabled={!currUser}>
                {editing ? 'Cancel Edit' : 'Start Edit'}
            </button>
            {editing && <UserForm values={currUser} action={saveEdit} />}
        </>,
    actions: {
        loadUser: async( { dispatch } ): Promise<void> => {
            dispatch( { path: 'currUser', value: 'loading...' } );
            dispatch( { path: 'currUser', value: await mockServer.getCurrUser() } );
        },
        toggleEdit: ( { dispatch, editing } ) => void
            dispatch( { path: 'editing', value: !editing } ),
        saveEdit: async( { dispatch, loadUser }, formValues ): Promise<void> => {
            dispatch( { path: 'editing', value: false } );
            dispatch( { path: 'currUser', value: 'updating...' } );
            await mockServer.updateCurrUser( formValues );
            dispatch( { path: 'currUser', value: 'updating complete' } );

            // reuse action load user
            // TODO: shall we maintain await? how?
            await loadUser();
        }
    }
} );
