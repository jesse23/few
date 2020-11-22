/* eslint-env jest */
import { wait } from '@/utils';
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

    // https://zellwk.com/blog/async-await-in-loops/
    it( 'await inside for', async() => {
        const res: number[] = [];
        const fnAwaitInFor = async() => {
            let i = 1;
            for ( let j = 0; j < 4; j++ ) {
                // eslint-disable-next-line no-await-in-loop
                await wait( 200 );
                res.push( i++ );
            }
        };

        fnAwaitInFor();
        await wait( 300 );
        expect( res ).toEqual( [ 1 ] );
        await wait( 200 );
        expect( res ).toEqual( [ 1, 2 ] );
        await wait( 500 );
        expect( res ).toEqual( [ 1, 2, 3, 4 ] );
    } );

    it( 'await inside forEach', async() => {
        const res: number[] = [];
        const fnAwaitInForEach = async() => {
            let i = 1;
            [ 1, 2, 3, 4 ].forEach( async() => {
                await wait( 200 );
                res.push( i++ );
            } );
        };

        fnAwaitInForEach();
        await wait( 250 );
        expect( res ).toEqual( [ 1, 2, 3, 4 ] );
    } );

    it( 'promise execute sequence', async() => {
        const res = [] as string[];
        const promise = new Promise( resolve => {
            res.push( 'inside resolve body' );

            setTimeout( () => {
                res.push( 'inside timeout before resolve' );
                resolve( null );
            }, 500 );
        } );

        const promise1 = promise.then( () => {
            res.push( 'inside then 1' );
        } ).then( () => {
            res.push( 'inside then 2' );
        } );

        const promise2 = promise.then( () => {
            res.push( 'inside then 3' );
        } );

        res.push( 'after promises defined' );

        await Promise.all( [ promise1, promise2 ] );

        /*
        practice below will follow seq 1->2->3
        await promise.then( ()=>{
            res.push( 'inside then 1' );
        } ).then( () => {
            res.push( 'inside then 2' );
        } );

        await promise.then( () => {
            res.push( 'inside then 3' );
        } );
        */

        res.push( 'after promises all' );

        expect( res ).toEqual( [
            'inside resolve body',
            'after promises defined',
            'inside timeout before resolve',
            'inside then 1',
            'inside then 3',
            'inside then 2',
            'after promises all'
        ] );
    } );

    // https://medium.com/better-programming/be-the-master-of-the-event-loop-in-javascript-part-1-6804cdf6608f
    it( 'Event Loop', async() => {
        const res = [] as string[];

        const syncFn = (): void => void res.push( 'syncFn' );
        const setTimeoutFn1 = (): void => void setTimeout( () => res.push( 'setTimeoutFn1' ) );
        const setTimeoutFn2 = (): void => void setTimeout( () => res.push( 'setTimeoutFn2' ) );
        const rafFn1 = (): void => void requestAnimationFrame( () => res.push( 'rafFn1' ) );
        const rafFn2 = (): void => void requestAnimationFrame( () => res.push( 'rafFn2' ) );
        const promiseFn1 = (): void => void Promise.resolve().then( () => res.push( 'promiseFn1_then1' ) ).then( () => res.push( 'promiseFn1_then2' ) );
        const promiseFn2 = (): void => void Promise.resolve().then( () => res.push( 'promiseFn2_then1' ) ).then( () => res.push( 'promiseFn2_then2' ) );
        const promiseFn3 = (): void => void Promise.all( [
            Promise.resolve().then( () => res.push( 'promiseFn3_all1' ) ),
            Promise.resolve().then( () => res.push( 'promiseFn3_all2' ) ).then( () => res.push( 'promiseFn3_all2.then1' ) )
        ] ).then( () => res.push( 'promiseFn3_then1' ) );

        res.push( 'start' );
        syncFn();
        setTimeoutFn1();
        promiseFn1();
        rafFn1();
        setTimeoutFn2();
        promiseFn2();
        rafFn2();
        promiseFn3();
        res.push( 'end' );

        await wait( 1000 );

        // NOTE: Jest use its own raf polyfill, which is same as safari but different with
        // edge/chrome/opera
        expect( res ).toEqual( [
            'start',
            'syncFn',
            'end',
            'promiseFn1_then1',
            'promiseFn2_then1',
            'promiseFn3_all1',
            'promiseFn3_all2',
            'promiseFn1_then2',
            'promiseFn2_then2',
            'promiseFn3_all2.then1',
            'promiseFn3_then1',
            // in chrome liz should be here
            // 'rafFn1',
            // 'rafFn2',
            'setTimeoutFn1',
            'setTimeoutFn2',
            'rafFn1',
            'rafFn2'
        ] );
    } );

    // https://medium.com/better-programming/be-the-master-of-the-event-loop-in-javascript-part-2-54637d49889f
    it( 'Event Loop with DOM', async() => {
        const res = [] as string[];
        const elem = document.createElement( 'div' );
        elem.innerHTML = `
<body>
  <div id="myDiv">
    <button id="myBtn">Click me</button>
  </div>
</body>
        `;
        document.body.appendChild( elem );

        const div = document.getElementById( 'myDiv' );
        const btn = document.getElementById( 'myBtn' );
        const t = ( key: string ): void => {
            setTimeout( () => res.push( `${key}.setTimeout` ) );
            requestAnimationFrame( () => res.push( `${key}.rAF` ) );
            Promise.resolve().then( () => res.push( `${key}.Promise` ) );
        };
        div.addEventListener( 'click', () => ( ( res.push( 'div.click' ), t( 'div' ) ) ) );
        btn.addEventListener( 'click', () => ( ( res.push( 'btn.click' ), t( 'btn' ) ) ) );
        btn.click();

        await wait( 1000 );

        // see the link above:
        // - Actual DOM click will be separate macro task
        // - elem.click will be in the same 'task'
        expect( res ).toEqual( [
            'btn.click',
            'div.click',
            'btn.Promise',
            'div.Promise',
            'btn.setTimeout',
            'div.setTimeout',
            'btn.rAF',
            'div.rAF'
        ] );
    } );
} );
