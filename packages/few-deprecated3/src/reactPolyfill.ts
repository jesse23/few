// React
import {
    useRef,
    useState,
    useEffect,
    Fragment,
    createElement, useCallback
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
            const initPromise = useRef( null );

            const [ state, setState ] = useState( () => {
                const model = isStatefulComponent( component ) ? component.init( props ) : {};

                const componentInstance = {} as Props;

                if ( isPromise( model ) ) {
                    initPromise.current = model;
                    componentInstance.model = {};
                } else {
                    componentInstance.model = model;
                }

                return componentInstance.model as Props;
            } );

            const stateRef = useRef( {
                model: state,
                actions: isStatefulComponent( component ) && component.actions ? Object.entries( component.actions ).reduce( ( sum, [ key, fn ] ) => {
                    sum[key] = ( ...args: any[] ): void => fn( stateRef.current.getScope( props ), ...args );
                    return sum;
                }, {} as Props ) : {},
                getState: () => stateRef.current.model,
                dispatch: ( { path, value }: DispatchInput ): void => {
                    stateRef.current.model = lodashFpSet( path, value, stateRef.current.model as never );
                    setState( stateRef.current.model );
                    // setState( model => lodashFpSet( path, value, model ) );
                },
                getScope: () => {
                    return {
                        ...stateRef.current.model,
                        ...stateRef.current.actions,
                        dispatch: stateRef.current.dispatch,
                        ...props
                    };
                }
            } as Props );

            // async init
            // https://stackoverflow.com/questions/49906437/how-to-cancel-a-fetch-on-componentwillunmount
            useEffect( () => {
                if ( initPromise.current ) {
                    // all API be consistent
                    Promise.resolve( initPromise.current ).then( model => {
                        // do Object.assign for mutation
                        stateRef.current.model = model;
                        setState( model );
                        // mount after async init
                    } ).then( () => {
                        // componentDef.mount && componentDef.mount( component );
                    } );
                } else {
                    // componentDef.mount && componentDef.mount( component );
                }

                return (): void => {
                    // componentDef.unmount && componentDef.unmount( component );
                };
            }, [] );

            return component.view( stateRef.current.getScope() );
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
