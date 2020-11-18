/* eslint-env jest */
import { STATE } from '@/types';
import { BUSY_INTERVAL, createProfiler, now, reset, MAX_WAIT_INTERVAL } from '@/profiler';
import { useMockTimer, wait } from './utils';
import { createMockObservable } from '@/mockObservable';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;
describe( 'Test profiler', () => {
    it( 'Verify state transition during profile', async() => {
        const profiler = createProfiler();
        expect( profiler.state ).toEqual( STATE.IDLE );
        expect( profiler.active ).toEqual( false );

        // start profiler
        const startTime = now();
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        // wait -> done
        const elapsed = await promise;
        const realElapsed = now() - startTime;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        // expect( elapsed ).toBeGreaterThan( 0 );
        expect( elapsed ).toBeLessThan( TOLERANCE );

        expect( realElapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( realElapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );

    it( 'Verify multiple profile will return the same promise', async() => {
        const profiler = createProfiler();

        const promise1 = profiler.profile();
        const promise2 = profiler.profile();
        expect( promise1 ).toBe( promise2 );
        expect( await promise1 ).toEqual( await promise2 );

        const promise3 = profiler.profile();
        expect( promise1 ).toBe( promise3 );
    } );
} );

describe( 'Test profiler with observable', () => {
    const mockObservable = createMockObservable();

    it( 'Verify state transition with observable by start-done in sync', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL / 2 );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL / 2 );
    } );

    it( 'Verify state transition with observable by start-done in async', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );

    it( 'Verify profile can handle "overlap procedure"', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        // mimic 2 overlap procedure
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();

        // one normal procedure
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 + 2 * BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + 2 * BUSY_INTERVAL );
    } );

    it( 'Verify profile can handle "procedure in progress" ( done signal come 1st )', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        // mimic 2 procedure are in progress already
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // one normal procedure
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 + 2 * BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + 2 * BUSY_INTERVAL );
    } );
} );

describe( 'Test profiler using mockTimer', () => {
    const mockObservable = createMockObservable();
    useMockTimer( () => reset() );

    it( 'Verify profile will error out if state is on hold for default maxWait', async() => {
        const profiler = createProfiler();
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();

        // wait -> done by timeout
        await wait( MAX_WAIT_INTERVAL );
        await expect(  promise ).rejects.toEqual( 'Time out in HOLD status after 30000ms' );
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );
    } );

    it( 'Verify profile will error out if state is on hold for given maxWait', async() => {
        const profiler = createProfiler( {
            maxWait: 500
        } );
        profiler.addObservable( mockObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();

        // wait -> done by timeout
        await wait( MAX_WAIT_INTERVAL );
        await expect(  promise ).rejects.toEqual( 'Time out in HOLD status after 500ms' );
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );
    } );
} );
