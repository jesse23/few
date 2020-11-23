/* eslint-env jest */
import { createMockObservable } from '@/observable';
import { createDebounceObserver, createMockObserver, createTtiObserver } from '@/observer';
import { BUSY_INTERVAL } from '@/state';
import { STATE } from '@/types';
import { wait } from './utils';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;

describe( 'Test observable/observer', () => {
    const mockObservable = createMockObservable();
    const printObserver = {
        onStart: (): void => {
            printObserver._stack.push( 'mockServer.onStart' );
        },
        onDone: (): void => {
            printObserver._stack.push( 'mockServer.onDone' );
        },
        _stack: [] as string[]
    };

    beforeEach( () => mockObservable.subscribe( printObserver ) );

    afterEach( () => {
        mockObservable.unsubscribe( printObserver );
        printObserver._stack = [];
    } );

    it( 'Verify observable mechanism', () => {
        mockObservable.mockStart();
        mockObservable.mockDone();

        expect( printObserver._stack ).toEqual( [
            'mockServer.onStart',
            'mockServer.onDone'
        ] );
    } );
} );


describe( 'Test observable/debounceObserver', () => {
    const output = [] as number[];
    const tti = [] as number[];
    const mockObservable = createMockObservable();
    const mockObserver = createMockObserver();
    const ttiObserver = createTtiObserver();
    const debounceObserver = createDebounceObserver( ()=>{
        output.push( mockObserver.getMetrics() );
        tti.push( ttiObserver.getMetrics() );
        // do reset here for next cycle
        mockObserver.reset();
        ttiObserver.reset();
        // debounceObserver.reset() --> reset to IDLE?
    } );

    beforeEach( () => {
        mockObservable.subscribe( debounceObserver );
        mockObservable.subscribe( mockObserver );
        mockObservable.subscribe( ttiObserver );
    } );

    afterEach( () => {
        output.length = 0;
        tti.length = 0;
        mockObservable.unsubscribe( debounceObserver );
        mockObservable.unsubscribe( mockObserver );
        mockObservable.unsubscribe( ttiObserver );
    } );

    it( 'Verify debounce observer for one cycle', async() => {
        mockObservable.mockStart();
        mockObservable.mockDone();

        await wait( BUSY_INTERVAL );

        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
        expect( mockObserver.getMetrics() ).toEqual( 0 );
        expect( output ).toEqual( [ 1 ] );
        expect( tti[0] ).toBeGreaterThanOrEqual( 0 );
        expect( tti[0] ).toBeLessThanOrEqual( TOLERANCE );
    } );

    it( 'Verify debounce observer for two cycle', async() => {
        // 1st tick
        mockObservable.mockStart();
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL );

        // 2nd tick
        mockObservable.mockStart();
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL / 2 );

        mockObservable.mockStart();
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL );

        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
        expect( mockObserver.getMetrics() ).toEqual( 0 );
        expect( output ).toEqual( [ 1, 2 ] );
        expect( tti[0] ).toBeGreaterThanOrEqual( 0 );
        expect( tti[0] ).toBeLessThanOrEqual( TOLERANCE );
        expect( tti[1] ).toBeGreaterThanOrEqual( 0 + BUSY_INTERVAL / 2 );
        expect( tti[1] ).toBeLessThanOrEqual( TOLERANCE + BUSY_INTERVAL / 2 );
    } );
} );
