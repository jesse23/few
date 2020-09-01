/* eslint-env jest */

describe( 'Javascript native feature test', () => {
    it( 'Test function with property', () => {
        const func = (): void => null;
        func.a = 3;
        const newFunc = func;
        expect( func.a ).toEqual( 3 );

        // the newFunc will have same context
        expect( newFunc.a ).toEqual( 3 );

        // newFun and fun share the same object
        newFunc.a = 4;
        expect( newFunc.a ).toEqual( 4 );
        expect( func.a ).toEqual( 4 );
    } );
} );
