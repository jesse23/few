// React
import {
    useRef,
    useReducer,
    useEffect,
    Fragment,
    createElement
} from 'react';

import ReactDOM from 'react-dom';

import lodashFpSet from 'lodash/fp/set';

import type {
    App,
    VDom,
    Props,
    DispatchInput,
    CreateAppFunction,
    Component
} from '@/types';

import { setH } from '@/vDom';

import {
    isComponent,
    isStatefulComponent,
    isPromise
} from '@/utils';

interface Store {
    getState: () => Props;
    dispatch: ( { path, value }: DispatchInput ) => void;
}

type InitFn = () => Props;

type UseStoreFn = ( fn: InitFn ) => Store;

const useInit = ( fn: Function, initialized = true ): void => {
    // assume fn does not change in this case
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect( () => initialized ? fn() : undefined, [ initialized ] );
};


/**
 * useStore hook to provide redux like API.
 * NOTE: return object is not stable but the API is stable.
 * https://transang.me/get-state-callback-with-usereducer/
 *
 * @param fn initialization function
 * @returns Store object
 */
const useStore = ( fn: InitFn ): Store => {
    const lastState = useRef( null );

    // to prevent reducer called twice, per: https://github.com/facebook/react/issues/16295
    const reducer = useRef( ( model: Props, { path, value }: DispatchInput ): Props =>
        lastState.current = path ? lodashFpSet( path, value, model as never ) : value
    ).current;

    const [ _, dispatch ] = useReducer( reducer, null, () => lastState.current = fn() );

    const getState = useRef( () => lastState.current ).current;

    return { getState, dispatch };
};

/**
 * useScope hook to provide action and other decl syntax support
 * NOTE: return object is not stable but the API is stable.
 * @param component component definition
 * @param props input properties
 * @param store core store object
 * @returns scope object
 */
const useScope = ( component: Component<Props>, props: Props, { getState, dispatch }: Store ): Store => {
    // ref to prop for callback closure
    // TODO: this may still have async side effect. The 2 async layer, UI/VDom and JS Engine Promise, they are
    // still not in harmony.
    const propRef = useRef( null );
    propRef.current = props;

    const actionsRef = useRef( null );

    // scope
    const getScope = useRef( () => ( {
        ...getState(),
        dispatch,
        ...actionsRef.current,
        ...propRef.current
    } ) ).current;

    // action initialization
    if ( !actionsRef.current ) {
        actionsRef.current = isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => ( {
            ...sum,
            [key]: ( ...args: any[] ): void => {
                fn( getScope(), ...args );
            }
        } ), {} as Props ) : {};
    }

    return {
        // keep API consistent
        getState: getScope,
        dispatch
    };
};

const useAsyncInitFn = ( initFn: InitFn ): [ InitFn, ( store: Store ) => [Props, boolean] ] => {
    const initRef = useRef( {
        done: false,
        pending: null as Promise<Props>
    } );

    const asyncInitFn: InitFn = (): Props => {
        const initRes = initFn();
        if ( isPromise( initRes ) ) {
            initRef.current.pending = initRes;
            return {};
        }
        initRef.current.done = true;
        return initRes;
    };

    const useAsyncInit = ( store: Store ): [Props, boolean] => {
        useInit( () => {
            // all API be consistent
            Promise.resolve( initRef.current.pending ).then( model => {
                initRef.current.pending = null;
                initRef.current.done = true;
                store.dispatch( { path: '', value: model } );
            } );
        }, Boolean( initRef.current.pending ) );

        return [ store, initRef.current.done ];
    };

    return [
        asyncInitFn,
        useAsyncInit
    ];
};

const h: VDom = {
    type: 'react',
    Fragment,
    createElement: ( type, props?, ...children ) => {
        if ( !type ) {
            return createElement( Fragment, props, ...children );
        } else if ( isComponent( type ) ) {
            if ( !type._compiled || !type._compiled.react ) {
                type._compiled = {
                    ...type._compiled,
                    react: h.createComponent( type )
                };
            }
            return createElement( type._compiled.react, props, ...children );
        }
        return createElement( type, props, ...children );
    },
    createComponent: component => Object.assign( ( props: Props ): JSX.Element => {
        // async init
        const [ initFn, useAsyncInit ] = useAsyncInitFn(
            () => isStatefulComponent( component ) ? component.init( props ) : {}
        );

        const [ scope, done ] = useAsyncInit( useScope( component, props, useStore( initFn ) ) );

        // onMount
        useInit( () => {
            component.mount && component.mount( scope.getState() );
            return (): void => component.unmount && component.unmount( scope.getState() );
        }, done );

        return component.view( scope.getState() );
    }, {
        displayName: component.name
    } )
};

export const createApp: CreateAppFunction = component => {
    setH( h );
    const vNode = h.createElement( component );
    const app: App = {
        mount: ( elem: HTMLElement ) => ( ( ReactDOM.render( vNode, elem ), app ) ),
        unmount: ( elem: HTMLElement ) => ( ( ReactDOM.unmountComponentAtNode( elem ), app ) )
    };
    return app;
};

export default h;
