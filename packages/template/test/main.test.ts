/* eslint-env jest */
import { compile } from '@/main';

describe( 'Test main function', () => {
    it( '1st unit test as stub', () => {
        expect( compile( '<div />' ) ).toEqual( 'Hi' );
    } );
} );
