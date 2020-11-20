/* eslint-env jest */
import { STATE } from '@/types';
import { useMockTimer, wait } from './utils';
import { createState, reset, BUSY_INTERVAL } from '@/state';

describe( 'Test state', () => {
    useMockTimer( () => reset() );
    it( 'Verify state transition during profile', async() => {
        const state = createState();
        expect( state.state ).toEqual( STATE.IDLE );
        expect( state.active ).toEqual( false );

        // idle -> wait
        state.toWait();
        expect( state.state ).toEqual( STATE.WAIT );
        expect( state.active ).toEqual( true );

        // wait interval
        await wait( BUSY_INTERVAL / 2 );
        expect( state.state ).toEqual( STATE.WAIT );
        expect( state.active ).toEqual( true );

        // wait -> hold
        state.toHold();
        expect( state.state ).toEqual( STATE.HOLD );
        expect( state.active ).toEqual( true );

        // hold interval
        await wait( BUSY_INTERVAL * 2 );
        expect( state.state ).toEqual( STATE.HOLD );
        expect( state.active ).toEqual( true );

        // hold -> wait
        state.toWait();
        expect( state.state ).toEqual( STATE.WAIT );
        expect( state.active ).toEqual( true );

        // wait -> done
        await wait( BUSY_INTERVAL );
        expect( state.state ).toEqual( STATE.DONE );
        expect( state.active ).toEqual( false );
    } );
} );
