/* eslint-env jest */
/* global */
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

    // https://stackoverflow.com/questions/60396600/set-size-of-window-in-jest-and-jest-dom-and-jsdom
    // https://github.com/jsdom/jsdom/blob/master/lib/jsdom/browser/Window.js#L643
    it( 'Test jest css capability', () => {
        // way to change window size:
        // Object.defineProperty( window, 'innerWidth', { writable: true, configurable: true, value: 1024 } );
        expect( window.innerWidth ).toBe( 1024 );
        expect( window.innerHeight ).toBe( 768 );
        const parent = document.createElement( 'div' );
        parent.style.width = '200px';
        parent.style.height = '200px';

        const elem = document.createElement( 'div' );
        elem.style.width = '100%';
        elem.style.height = '100%';
        parent.appendChild( elem );

        document.body.appendChild( parent );

        // NOTE: window.getComputedStyle has very limited ability in jsdom
        // In chrome styleInfo.width will return exact width like '379px'
        const styleInfo = window.getComputedStyle( elem );
        expect( styleInfo.width ).toEqual( '100%' );
    } );

    // https://zhuanlan.zhihu.com/p/104565681
    it( 'Test class hierarchy on instanced method(arrow member function)', () => {
        const logArr: string[] = [];

        // sub class in arrow member function case
        class ParentArrowMemberFn {
            constructor() {
                this.setup();
            }

            setup = (): void => {
                logArr.push( 'ParentArrowMemberFn::setup' );
            }
        }

        class ChildArrowMemberFn extends ParentArrowMemberFn {
            constructor() {
                super();
            }

            setup = (): void => {
                logArr.push( 'ChildArrowMemberFn::setup' );
            }
        }


        // sub class in normal member function case
        class ParentNormalMemberFn {
            constructor() {
                this.setup();
            }

            setup(): void {
                this;
                logArr.push( 'ParentNormalMemberFn::setup' );
            }
        }

        class ChildNormalMemberFn extends ParentNormalMemberFn {
            constructor() {
                super();
            }

            setup(): void {
                this;
                logArr.push( 'ChildNormalMemberFn::setup' );
            }
        }

        new ChildArrowMemberFn();
        new ChildNormalMemberFn();

        expect( logArr ).toEqual( [
            'ParentArrowMemberFn::setup',
            'ChildNormalMemberFn::setup'
        ] );
    } );
} );
