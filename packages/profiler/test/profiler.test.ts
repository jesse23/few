/* eslint-env jest */
import { STATE, BUSY_INTERVAL, createProfiler, now } from '@/profiler';

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
        const realElapesd = now() - startTime;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 );
        expect( elapsed ).toBeLessThan( TOLERANCE );

        expect( realElapesd ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( realElapesd ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );

        /*
        const promise = profiler.profile();
        expect( elapsed ).toBeGreaterThan( 0 );
        expect( elapsed ).toBeLessThan( 10 );
        */
    } );
} );
