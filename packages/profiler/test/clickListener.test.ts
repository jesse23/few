/* eslint-env jest */
import { STATE } from '@/types';
import { BUSY_INTERVAL, createProfiler } from '@/profiler';
import { wait } from './utils';
import ClickListener from '@/clickListener';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;

describe( 'Test profiler with ClickListener', () => {
    const clickObservable = new ClickListener();

    beforeEach( () => clickObservable.install() );

    afterEach( () => clickObservable.uninstall() );

    it( 'Verify state transition with observable by clicking DOM Element', async() => {
        const profiler = createProfiler();
        profiler.addObservable( clickObservable );

        // start profiler
        const promise = profiler.profile();
        expect( profiler.state ).toEqual( STATE.WAIT );
        expect( profiler.active ).toEqual( true );

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        // wait -> done
        const elapsed = await promise;
        expect( profiler.state ).toEqual( STATE.DONE );
        expect( profiler.active ).toEqual( false );

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );
} );
