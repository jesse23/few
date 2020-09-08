// React
import {
    useRef,
    useState,
    useEffect,
    Fragment,
    createElement
} from 'react';

import ReactDOM from 'react-dom';

import lodashSet from 'lodash/set';

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
            const initPromise = useRef( null );

            // Approach 1:
            // - state = { vm: { ...model, ...actions, ...props, dispatch } }
            //   - All existing bindings will be on vm
            //   - {...state } is safe to trigger re-render without corrupt any bindings
            //   - helper var like initPromise can be part of state - as soon as no one will use state
            //     directly we are good
            const [ vm, setState ] = useState( () => {
                const model = isStatefulComponent( component ) ? component.init( props ) : {};
                if ( isPromise( model ) ) {
                    initPromise.current = model;
                    return {
                        model: {}
                    };
                }
                return {
                    model
                };
            } );

            const dispatch = ( { path, value }: DispatchInput ): void => {
                lodashSet( vm.model, path, value );
                setState( { ...vm } );
            };

            // Assign prop and action
            Object.assign( vm.model, props );
            Object.assign( vm.model, { dispatch } );

            // async init
            // https://stackoverflow.com/questions/49906437/how-to-cancel-a-fetch-on-componentwillunmount
            useEffect( () => {
                if ( initPromise.current ) {
                    // all API be consistent
                    Promise.resolve( initPromise.current ).then( model =>
                        // do Object.assign for mutation
                        setState( v => ( ( Object.assign( v.model, model ), { ...v } ) ) )
                        // mount after async init
                    ).then( () => {
                        // componentDef.mount && componentDef.mount( component );
                    } );
                } else {
                    // componentDef.mount && componentDef.mount( component );
                }

                return (): void => {
                    // componentDef.unmount && componentDef.unmount( component );
                };
            }, [] );

            return component.view( vm.model );
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
