import { h, defineComponent } from '@/vDom';
import { wait } from '@/utils';

export default defineComponent( {
    name: 'AsyncViewExample',
    init: () => ( {
        currNum: 7
    } ),
    view: ( { currNum, dispatch } ): JSX.Element =>
        <>
            <div id='asyncElem'>
                {h.await( async(): Promise<JSX.Element> => ( ( await wait( 500 ), <code>Async String</code> ) ) )}
            </div>
            <div id='plusPanel'>
                <div>{currNum}</div>
                <button id='plus' onClick={() => void
                    dispatch( { path: 'currNum', value: ( currNum as number ) + 1 } )
                }>+1</button>
            </div>
        </>
} );
