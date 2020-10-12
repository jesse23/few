// React
import {
    useRef,
    useState,
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
import { sum } from 'lodash';

const useInit = ( fn: Function, initialized = true ): void => {
    // assume fn does not change in this case
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect( () => initialized ? fn() : undefined, [ initialized ] );
};

interface Store {
    getState: () => Props;
    dispatch: ( { path, value }: DispatchInput ) => void;
}

type InitFn = () => Props;

type UseStoreFn = ( fn: InitFn ) => Store;

const useStore = ( fn: InitFn ): Store => {
    const modelRef = useRef( null );

    const [ model, setModel ] = useState( fn );
    modelRef.current = model;

    const storeRef = useRef( {
        getState: () => modelRef.current,
        dispatch: ( { path, value }: DispatchInput ): void => {
            // TODO: temp fix for `setState` usage
            modelRef.current.model = path ? lodashFpSet( path, value, modelRef.current.model as never ) : value;
            setModel( modelRef.current.model );
            // setState( model => lodashFpSet( path, value, model ) );
        }
    } );

    return storeRef.current;
};

const useScope = ( component: Component<Props>, props: Props, store: Store ): Store => {
    // ref to prop for action use case
    const propRef = useRef( null );
    propRef.current = props;

    const actionsRef = useRef( null );

    // scope
    const scopeRef = useRef( {
        getState: (): Props => ( {
            ...store.getState(),
            dispatch: store.dispatch,
            ...actionsRef.current,
            ...propRef.current
        } as Props ),
        dispatch: store.dispatch
    } );

    // action
    if ( !actionsRef.current ) {
        actionsRef.current = isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => ( {
            ...sum,
            [key]: ( ...args: any[] ): void => fn( scopeRef.current.getState(), ...args )
        } ), {} as Props ) : {};
    }

    return scopeRef.current;
};

const useAsyncInit = ( useStoreFn: UseStoreFn, initFn: InitFn ): [Props, boolean] => {
    const initRef = useRef( {
        done: false,
        pending: null as Promise<Props>
    } );

    const store = useStoreFn( () => {
        const result = initFn();
        if ( isPromise( result ) ) {
            initRef.current.pending = result;
            return {};
        }
        initRef.current.done = true;
        return result;
    } );

    useInit( () => {
        // all API be consistent
        Promise.resolve( initRef.current.pending ).then( model => {
            // do Object.assign for mutation
            initRef.current.pending = null;
            initRef.current.done = true;
            store.dispatch( { path: '', value: model } );
        } );
    }, Boolean( initRef.current.pending ) );

    return [ store, initRef.current.done ];
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
        const [ scope, done ] = useAsyncInit(
            fn => useScope( component, props, useStore( fn ) ),
            () => isStatefulComponent( component ) ? component.init( props ) : {}
        );

        // onMount
        useInit( () => {
            // componentDef.mount && componentDef.mount( component );
            return (): void => {
                // componentDef.unmount && componentDef.unmount( component );
            };
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
