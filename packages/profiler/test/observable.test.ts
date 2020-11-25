/* eslint-env jest */
import { wait } from './utils';
import { STATE, PerfObserver, Subscription } from '@/types';
import { BUSY_INTERVAL } from '@/state';
import {
    createMockObservable
} from '@/observable';
import {
    createCountObserver,
    createDebounceObserver,
    createTtiObserver
} from '@/observer';

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;

const printObserver: PerfObserver & { _stack: string[] } = {
    onStart: (): void => {
        printObserver._stack.push( 'mockServer.onStart' );
    },
    onDone: (): void => {
        printObserver._stack.push( 'mockServer.onDone' );
    },
    getMetrics: (): string[] => {
        return printObserver._stack;
    },
    reset: (): void => {
        printObserver._stack = [];
    },
    _stack: []
};

describe( 'Test observable/observer', () => {
    let subscription: Subscription;
    const mockObservable = createMockObservable();

    beforeEach( () => {
        subscription = mockObservable.subscribe( printObserver );
    } );

    afterEach( () => {
        subscription.unsubscribe();
        printObserver.reset();
    } );

    it( 'Verify observable mechanism', () => {
        mockObservable.mockStart();
        mockObservable.mockStart();
        mockObservable.mockDone();
        mockObservable.mockDone();
        mockObservable.mockStart();
        mockObservable.mockDone();

        expect( printObserver.getMetrics() ).toEqual( [
            'mockServer.onStart',
            'mockServer.onStart',
            'mockServer.onDone',
            'mockServer.onDone',
            'mockServer.onStart',
            'mockServer.onDone'
        ] );
    } );
} );

describe( 'Test observable/debounceObserver', () => {
    const output = [] as any[];
    const subscriptions: Subscription[] = [];
    const mockObservable = createMockObservable();

    const countObserver = createCountObserver();
    const ttiObserver = createTtiObserver();
    const debounceObserver = createDebounceObserver( () => {
        // debounceObserver.getMetrics() --> getMetrics for all member inside?
        // output and tti in the real case it will be one place
        output.push( {
            count: countObserver.getMetrics(),
            tti: ttiObserver.getMetrics()
        } );
        // do reset here for next cycle. Or reset in next cycle?
        countObserver.reset();
        ttiObserver.reset();
        // debounceObserver.reset() --> reset to IDLE?
    } );

    beforeEach( () => {
        // different observer might subscribe to different observable
        // but the debounceObserver logic will be shared
        subscriptions.push( mockObservable.subscribe( debounceObserver ) );
        subscriptions.push( mockObservable.subscribe( countObserver ) );
        subscriptions.push( mockObservable.subscribe( ttiObserver ) );
    } );

    afterEach( () => {
        subscriptions.forEach( sub => sub.unsubscribe() );
        subscriptions.splice( 0, subscriptions.length );
        output.splice( 0, output.length );
        // output.length = 0;
    } );

    it( 'Verify debounce observer for one cycle', async() => {
        mockObservable.mockStart();
        mockObservable.mockDone();

        await wait( BUSY_INTERVAL );

        expect( output.length ).toEqual( 1 );
        expect( output[0].tti ).toBeGreaterThanOrEqual( 0 );
        expect( output[0].tti ).toBeLessThanOrEqual( TOLERANCE );

        // observer will be reset after getMetrics
        expect( countObserver.getMetrics() ).toEqual( 0 );
        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
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

        expect( output.length ).toEqual( 2 );
        expect( output[0].tti ).toBeGreaterThanOrEqual( 0 );
        expect( output[0].tti ).toBeLessThanOrEqual( TOLERANCE );
        expect( output[0].count ).toEqual( 1 );
        expect( output[1].tti ).toBeGreaterThanOrEqual( 0 + BUSY_INTERVAL / 2 );
        expect( output[1].tti ).toBeLessThanOrEqual( TOLERANCE + BUSY_INTERVAL / 2 );
        expect( output[1].count ).toEqual( 2 );

        // observer will be reset after getMetrics
        expect( countObserver.getMetrics() ).toEqual( 0 );
        expect( debounceObserver.getState() ).toEqual( STATE.DONE );
    } );
} );
