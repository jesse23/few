/* eslint-env jest */

interface Component {
    props: {
        [key: string]: number;
    };
    model: {
        [key: string]: number;
    };
}

const renderDef = ( { props, model }: Component ): number => props.a + model.b;

describe( 'native JS features', () => {
    it( 'Test scope binding for a function', () => {
        const component = {
            props: { a: 3 },
            model: { b: 5 }
        };

        const renderFn = (): number => renderDef( component );

        expect( renderFn() ).toEqual( 8 );
    } );

    it( 'Test value change in function binding', () => {
        const component = {
            props: { a: 3 },
            model: { b: 5 }
        };

        const renderFn = (): number => renderDef( component );

        component.model.b = 7;

        expect( renderFn() ).toEqual( 10 );
    } );

    it( 'Test object change in function binding', () => {
        const component = {
            props: { a: 3 },
            model: { b: 5 }
        };

        const renderFn = (): number => renderDef( component );

        component.props = { a: 5 };

        expect( renderFn() ).toEqual( 10 );
    } );

    it( 'Test scope change in function binding', () => {
        let component = {
            props: { a: 3 },
            model: { b: 5 }
        };

        const renderFn = (): number => renderDef( component );

        component = {
            props: { a: 4 },
            model: { b: 6 }
        };

        expect( renderFn() ).toEqual( 10 );
    } );
} );
