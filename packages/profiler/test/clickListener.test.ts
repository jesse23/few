/* eslint-env jest */
import { profile } from '@/profiler';
import { reset, BUSY_INTERVAL, MAX_WAIT_INTERVAL } from '@/state';
import { wait } from './utils';
import ClickListener, { createDomEventObservable } from '@/clickListener';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;

describe( 'Test profiler with ClickListener', () => {
    const clickObservable = new ClickListener();

    beforeEach( () => clickObservable.install() );

    afterEach( () => clickObservable.uninstall() );

    it( 'Verify state transition with observable ClickListener', async() => {
        const promise = profile( [ clickObservable ] );

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        // wait -> done
        const elapsed = await promise;

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );
} );

describe( 'Test profiler with createDomEventObservable', () => {
    it( 'Verify state transition with observable from createDomEventObservable', async() => {
        // start profiler
        const promise = profile( [ createDomEventObservable() ] );

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        await wait( BUSY_INTERVAL / 2 );
        document.body.click();

        // wait -> done
        const elapsed = await promise;

        expect( elapsed ).toBeGreaterThan( 0 + BUSY_INTERVAL );
        expect( elapsed ).toBeLessThan( TOLERANCE + BUSY_INTERVAL );
    } );
} );
