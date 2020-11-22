/* eslint-env jest */
import { createMockObservable, createMockObserver } from '@/mockObservable';
import { createDebounceObserver } from '@/profiler';
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
    const mockObservable = createMockObservable();
    const mockObserver = createMockObserver();
    const debounceObserver = createDebounceObserver( ()=>{
        output.push( mockObserver.getMetrics() );
    } );

    beforeEach( () => {
        mockObservable.subscribe( debounceObserver );
        mockObservable.subscribe( mockObserver );
    } );

    afterEach( () => {
        output.length = 0;
        mockObservable.unsubscribe( debounceObserver );
        mockObservable.unsubscribe( mockObserver );
    } );

    it( 'Verify debounce observer for one cycle', async() => {
        mockObservable.mockStart();
        mockObservable.mockDone();

        await wait( BUSY_INTERVAL );

        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
        expect( mockObserver.getMetrics() ).toEqual( 1 );
        expect( output ).toEqual( [ 1 ] );
    } );

    it( 'Verify debounce observer for two cycle', async() => {
        mockObservable.mockStart();
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL );

        mockObservable.mockStart();
        mockObservable.mockDone();
        await wait( BUSY_INTERVAL );

        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
        expect( mockObserver.getMetrics() ).toEqual( 3 );
        expect( output ).toEqual( [ 2, 3 ] );
    } );
} );
