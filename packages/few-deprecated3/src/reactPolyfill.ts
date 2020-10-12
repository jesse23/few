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
    CreateAppFunction
} from '@/types';

import { setH } from '@/vDom';

import {
    isComponent,
    isStatefulComponent,
    isPromise
} from '@/utils';

const useInit = ( fn: Function, initialized = true ): void => {
    // assume fn does not change in this case
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect( () => initialized ? fn() : undefined, [ initialized ] );
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
    createComponent: component => {
        const RenderFn = ( props: Props ): JSX.Element => {
            /// const scope = useRef( {} as Props );
            const initRef = useRef( {
                pending: null as Promise<Props>,
                done: false
            } );

            const [ model, setModel ] = useState( () => {
                const model = isStatefulComponent( component ) ? component.init( props ) : {};

                if ( isPromise( model ) ) {
                    initRef.current.pending = model;
                    return {};
                }
                initRef.current.done = true;
                return model;
            } );

            const vmInstanceRef = useRef( {
                props,
                model,
                // getState: () => stateRef.current.model,
                dispatch: ( { path, value }: DispatchInput ): void => {
                    vmInstanceRef.current.model = lodashFpSet( path, value, vmInstanceRef.current.model as never );
                    setModel( vmInstanceRef.current.model );
                    // setState( model => lodashFpSet( path, value, model ) );
                },
                actions: isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => {
                    sum[key] = ( ...args: any[] ): void => fn( vmInstanceRef.current.getScope(), ...args );
                    return sum;
                }, {} as Props ) : {},
                getScope: () => {
                    return {
                        ...vmInstanceRef.current.model,
                        dispatch: vmInstanceRef.current.dispatch,
                        ...vmInstanceRef.current.actions,
                        ...vmInstanceRef.current.props
                    };
                }
            } );

            vmInstanceRef.current.props = props;

            // async init
            // https://stackoverflow.com/questions/49906437/how-to-cancel-a-fetch-on-componentwillunmount
            useInit( () => {
                // all API be consistent
                Promise.resolve( initRef.current.pending ).then( model => {
                    // do Object.assign for mutation
                    initRef.current.pending = null;
                    initRef.current.done = true;
                    vmInstanceRef.current.model = model;
                    setModel( model );
                    // mount after async init
                } );
            }, Boolean( initRef.current.pending ) );

            // onMount
            useInit( () => {
                // componentDef.mount && componentDef.mount( component );
                return (): void => {
                    // componentDef.unmount && componentDef.unmount( component );
                };
            }, initRef.current.done );

            return component.view( vmInstanceRef.current.getScope() );
        };
        RenderFn.displayName = component.name;
        return RenderFn;
    }
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
