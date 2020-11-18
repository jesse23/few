/* eslint-env jest */
import { STATE, Subscription } from '@/types';
import { BUSY_INTERVAL, createProfiler, now, reset, MAX_WAIT_INTERVAL } from '@/profiler';
import { useMockTimer, wait } from './utils';
import { createSession } from '@/session';
import { createMockObservable } from '@/mockObservable';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;
describe( 'Test session', () => {
    const mockObservable = createMockObservable();

    it( 'Verify state transition during profile', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );
        const session = createSession( profiler );
        session.addObservable( mockObservable );

        const mockSubscription = {
            _res: [] as number[],
            onUpdate: ( content: number ): void => {
                mockSubscription._res.push( content );
            }
        };
        session.addSubscription( mockSubscription );

        // enable session
        session.enable();

        // profiler should be still in IDLE state
        expect( profiler.state ).toEqual( STATE.IDLE );
        expect( profiler.active ).toEqual( false );

        // trigger observable to enable session
        mockObservable.mockStart();
        expect( profiler.state ).toEqual( STATE.HOLD );
        expect( profiler.active ).toEqual( true );
        mockObservable.mockDone();

        // wait sufficient timeout
        await wait( BUSY_INTERVAL );

        // assert subscription
        expect( mockSubscription._res[0] ).toBeGreaterThan( 0 );
        expect( mockSubscription._res[0] ).toBeLessThan( TOLERANCE );
    } );
} );
