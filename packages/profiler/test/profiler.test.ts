/* eslint-env jest */
import { STATE } from '@/types';
import { BUSY_INTERVAL, createProfiler, now } from '@/profiler';

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

        expect( elapsed ).toBeGreaterThan( 0 );
        expect( elapsed ).toBeLessThan( TOLERANCE );

        expect( realElapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( realElapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );

    it( 'Verify multiple profile will return the same promise', async() =>{
        const profiler = createProfiler();

        const promise1 = profiler.profile();
        const promise2 = profiler.profile();
        expect( promise1 ).toBe( promise2 );
        expect( await promise1 ).toEqual( await promise2 );

        const promise3 = profiler.profile();
        expect( promise1 ).toBe( promise3 );
    } );
} );
