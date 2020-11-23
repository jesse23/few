/* eslint-env jest */
import { STATE, Subscription } from '@/types';
import { profile, now } from '@/profiler';
import { BUSY_INTERVAL, MAX_WAIT_INTERVAL, reset } from '@/state';
import { useMockTimer, wait } from './utils';
import { createSession } from '@/session';
import { createMockObservable } from '@/observable';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;
xdescribe( 'Test session', () => {
    const mockObservable = createMockObservable();

    it( 'Verify session works for single observable practice', async() => {
        const profiler = null as any;
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

    it( 'Verify multiple observable event in same cycle will be counted as one', async() => {
        const profiler = null as any;
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
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();
        mockObservable.mockStart();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // wait sufficient timeout
        await wait( BUSY_INTERVAL );

        // assert subscription
        expect( mockSubscription._res[0] ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( mockSubscription._res[0] ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );

    it( 'Verify multiple observable event in different cycle will be counted as different', async() => {
        const profiler = null as any;
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
        await wait( BUSY_INTERVAL * 2 );

        mockObservable.mockStart();
        await wait( BUSY_INTERVAL );
        mockObservable.mockDone();

        // wait sufficient timeout
        await wait( BUSY_INTERVAL );

        // assert subscription
        // expect( mockSubscription._res ).toEqual( [] );
        expect( mockSubscription._res.length ).toEqual( 2 );
        expect( mockSubscription._res[0] ).toBeGreaterThan( 0 );
        expect( mockSubscription._res[0] ).toBeLessThan( TOLERANCE );
        expect( mockSubscription._res[1] ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( mockSubscription._res[1] ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );
} );
