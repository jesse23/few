/* eslint-env jest */
import { createMockObservable } from '@/mockObservable';

const mockObserver = {
    onStart: (): void => {
        mockObserver._stack.push( 'mockServer.onStart' );
    },
    onDone: (): void => {
        mockObserver._stack.push( 'mockServer.onDone' );
    },
    _stack: [] as string[]
};

// JS timer is inaccurate since it is passive, put a TOLERANCE for test verification
const TOLERANCE = 50;
describe( 'Test observable/observer', () => {
    const mockObservable = createMockObservable();

    beforeEach( () => mockObservable.subscribe( mockObserver ) );

    afterEach( () => {
        mockObservable.unsubscribe( mockObserver );
        mockObserver._stack = [];
    } );

    it( 'Verify observable mechanism', async() => {
        mockObservable.mockStart();
        mockObservable.mockDone();

        expect( mockObserver._stack ).toEqual( [
            'mockServer.onStart',
            'mockServer.onDone'
        ] );
    } );
} );
