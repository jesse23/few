/* eslint-env jest */
import { reset, BUSY_INTERVAL, MAX_WAIT_INTERVAL } from '@/state';
import { profile } from '@/profiler';
import { useMockTimer, wait } from './utils';
import { createMockObservable } from '@/observable';
import { now } from '@/utils';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;
describe( 'Test profiler', () => {
    it( 'Verify state transition during profile', async() => {
        const startTime = now();
        const promise = profile();

        // wait -> done
        const elapsed = await promise;
        const realElapsed = now() - startTime;

        // expect( elapsed ).toBeGreaterThan( 0 );
        expect( elapsed ).toBeLessThan( TOLERANCE );

        expect( realElapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( realElapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );
} );

describe( 'Test profiler with observable', () => {
    const mockObservable = createMockObservable();

    it( 'Verify state transition with observable by start-done in sync', async() => {
        const promise = profile( [ mockObservable ] );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL / 2 );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL / 2 );
    } );

    it( 'Verify state transition with observable by start-done in async', async() => {
        const promise = profile( [ mockObservable ] );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();
        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockDone();

        // wait -> done
        const elapsed = await promise;

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );

    it( 'Verify profile can handle "overlap procedure"', async() => {
        const promise = profile( [ mockObservable ] );

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

        expect( elapsed ).toBeGreaterThan( 0 + 2 * BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + 2 * BUSY_INTERVAL );
    } );

    it( 'Verify profile can handle "procedure in progress" ( done signal come 1st )', async() => {
        const promise = profile( [ mockObservable ] );

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

        expect( elapsed ).toBeGreaterThan( 0 + 2 * BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + 2 * BUSY_INTERVAL );
    } );
} );

describe( 'Test profiler using mockTimer', () => {
    const mockObservable = createMockObservable();
    useMockTimer( () => reset() );

    it( 'Verify profile will error out if state is on hold for default maxWait', async() => {
        const promise = profile( [ mockObservable ] );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();

        // wait -> done by timeout
        await wait( MAX_WAIT_INTERVAL );
        await expect(  promise ).rejects.toEqual( 'Time out in HOLD status after 30000ms' );
    } );

    it( 'Verify profile will error out if state is on hold for given maxWait', async() => {
        const promise = profile( [ mockObservable ], {
            maxWait: 500
        } );

        await wait( BUSY_INTERVAL / 2 );
        mockObservable.mockStart();

        // wait -> done by timeout
        await wait( MAX_WAIT_INTERVAL );
        await expect(  promise ).rejects.toEqual( 'Time out in HOLD status after 500ms' );
    } );
} );
