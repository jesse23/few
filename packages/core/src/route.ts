/* eslint-env es6 */
/**
 * Routing Service
 * https://github.com/Few-UI/few-custom-element/blob/master/src/few-route-service.js
 * https://github.com/riot/route/blob/master/src/index.js
 */

/*
page.js test code:
- it can achieve client side routing with 'http://site/route' without #.
- it has side effect for top level. ( 'about' below should be '/about' if no issue)
- it hijack all the a link which may not be a good practice
<script src="https://unpkg.com/page/page.js"></script>
<script>
  page.base('/');
  page('/', function() {
      console.log('index')
  })
  page('about', function(){
    // Do stuff
    console.log('about');
  });
  page('/#/about', function(){
    // Do stuff
    console.log('about');
  });
  page();
</script>
<a href="./about">about</a>
*/

// types
interface RouteState {
    id: string;
    path: string;
    parent: string;
    enter: Function;
    leave: Function;
    data?: object;
    params?: {
        [key: string]: string;
    };
}

interface RouteTransition {
    prevState: RouteState;
    currState: RouteState;
}

interface RoutStateMap {
    [key: string]: RouteState;
}


let _started = false;
const RE_ORIGIN = /^.+?\/\/+[^/]+/;
const win = typeof window !== 'undefined' && window;
const loc = win && win.location; // see html5-history-api

// const POPSTATE = 'popState';
const HASHCHANGE = 'hashchange';
const HASH = '#';

const _routeChangeCallBacks: Function[] = [];
const _states: RoutStateMap = {};

let currState: RouteState;


/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
/*
function DEFAULT_PARSER( path ) {
    return path.split( /[/?#]/ );
}
*/

/**
 *
 * Returns Base URL for the current application
 *
 * @returns Base URL for the current application's root 'document' without any query or location attributes
 *          and (if otherwise valid) with a trailing '/' assured.
 */
export const getBaseURL: { (): string; _baseURL?: string } = () => {
    if ( !getBaseURL._baseURL ) {
        // strip 'index.html' from end of pathname if present
        const location = window.location;

        const pathname = location.pathname;

        // IE11 on Windows 10 doesn't have 'location.origin' object
        const origin = location.origin || location.protocol + '//' + location.hostname +
            ( location.port ? ':' + location.port : '' );

        getBaseURL._baseURL = origin + pathname.substring( 0, pathname.lastIndexOf( '/' ) + 1 );
    }

    return getBaseURL._baseURL;
};


/**
 * Get the part after domain name
 * @param href - fullpath
 * @returns path from root
 */
const getPathFromRoot = ( href: string ): string => {
    return ( href || loc.href ).replace( RE_ORIGIN, '' );
};


/**
 * Get the part after base
 * @param href - fullpath
 * @returns path from base
 */
export const getPathFromBase = ( href: string ): string => {
    const base = '#';
    return base[0] === '#' ?
        ( href || loc.href || '' ).split( base )[1] || '' :
        ( loc ? getPathFromRoot( href ) : href || '' ).replace( base, '' );
};

/**
 * Match state with pre-defined pattern
 * @param allMatchedState allMatchedState
 * @param state state
 * @param states states
 */
const updateStateHierarchy = ( allMatchedState: RouteState[], state: RouteState, states: RoutStateMap ): string[] => {
    if ( !states[state.parent] ) {
        allMatchedState.push( state );
        return;
    }
    updateStateHierarchy( allMatchedState, states[state.parent], states );
    allMatchedState.push( state );
};

/**
 * math url with pre-defined pattern
 * @param pattern pattern as string
 * @param urlParamStr input url
 * @returns true if url matches
 */
export function matchUrl( pattern: string, urlParamStr: string ): boolean {
    return pattern === urlParamStr;
}

/**
 * Get Updated query params from url
 * @param url url
 * @param params query params
 * @returns updated params
 */
const getUpdatedQueryParams = ( url: string, params: { [key: string]: string } ): { [key: string]: string } => {
    if ( url.includes( '?' ) ) {
        const paramsArr = url.split( '?' )[1].split( '&' );
        const res: { [key: string]: string } = {};
        paramsArr.forEach( paramStr => {
            const paramKey = paramStr.split( '=' )[0];
            const paramValue = paramStr.split( '=' )[1];
            if ( params[paramKey] ) {
                res[paramKey] = paramValue;
            }
        } );
        return res;
    }
    return params;
};


/**
 * Match state with pre-defined pattern
 * @param states states
 * @param urlParamStr input url
 * @returns result
 */
export const getMatchedStateData = ( states: RoutStateMap, urlParamStr: string ): {
    stateHierarchies: RouteState[];
    currentState: RouteState;
    finalURL: string;
} => {
    for ( const state in states ) {
        const result: {
            stateHierarchies: RouteState[];
            currentState: RouteState;
            finalURL: string;
        } = {
            stateHierarchies: null,
            currentState: null,
            finalURL: null
        };

        const allMatchedState: RouteState[] = [];
        updateStateHierarchy( allMatchedState, states[state], states );
        const finalURL = allMatchedState.map( ( elem ) => elem.path ).join( '' );
        result.stateHierarchies = allMatchedState;
        result.currentState = states[state];
        result.finalURL = finalURL;
        //handle query_params and update params
        let urlToMatch = urlParamStr;
        if ( urlParamStr && result.currentState.params ) {
            urlToMatch = urlParamStr.split( '?' )[0];
            if ( matchUrl( finalURL, urlToMatch ) ) {
                result.currentState.params = getUpdatedQueryParams( urlParamStr, result.currentState.params );
            }
        }
        if ( matchUrl( finalURL, urlToMatch ) ) {
            return result;
        }
    }
};

/**
 * Navigate to state
 * https://ui-router.github.io/ng1/docs/0.3.1/index.html#/api/ui.router.state.$state#methods_go
 * @param to state name
 * @param params params
 * @param options options
 */
export function go( to: string, params: { [key: string]: string }, options: { reload: boolean } ): void {
    //build URL
    const allMatchedState: RouteState[] = [];
    if ( _states[to] ) {
        updateStateHierarchy( allMatchedState, _states[to], _states );
        let toURL = allMatchedState.map( ( elem ) => elem.path ).join( '' );
        toURL = `${getBaseURL()}${HASH}${toURL}`;
        _states[to].params = _states[to].params ? _states[to].params : {};
        // handle params
        if ( params ) {
            //query params
            if ( _states[to].params && !_states[to].path.includes( '/:' ) ) {
                toURL += '?';
                for ( const key in params ) {
                    toURL += key + '=' + params[key];
                }
                //resolve query params
                _states[to].params = getUpdatedQueryParams( toURL, _states[to].params );
            }

            //TODO lets resolve the params in URL.. example- "url": "/:parentCategory/:category"
            if ( _states[to].path.split( '/:' ).length > 1 ) {
                _states[to].path.split( '/:' ).forEach( param => {
                    if ( param ) {
                        toURL = toURL.replace( `:${param}`, params[param] );
                        _states[to].params[param] = params[param];
                    }
                } );
            }
        }

        win.history.pushState( {}, to, toURL );

        //handle options
        if ( options && options.reload ) {
            location.reload();
        }
    } else {
        // state not found
    }
}

/**
 * internal method to process URL
 * @param url current URL transit to
 */
const _processURL = ( url: string ): void => {
    // let urlStruct = DEFAULT_PARSER( getPathFromBase( url ) );
    const urlParam = getPathFromBase( url );
    for ( const unit in _routeChangeCallBacks ) {
        const routeChangeCallback = _routeChangeCallBacks[unit];
        if ( _states && Object.keys( _states ).length > 0 ) {
            if ( !urlParam ) {
                //TODO: get the default state name from workspace
                const defaultStateName = Object.keys( _states )[0];
                currState = _states[defaultStateName];
                go( defaultStateName, currState.params, { reload: true } );
            } else {
                let newState = null;
                // const params = {};
                const matchedStateData = getMatchedStateData( _states, urlParam );

                if ( matchedStateData ) {
                    newState = matchedStateData.currentState;
                }

                // process state
                if ( newState ) {
                    // TODO: we can do view based routing:
                    // - if currState.view === newState.view, update data
                    // - else switch view
                    if ( currState === newState ) {
                        // TODO: update param and set state
                        // this._component.updateModel( params );
                    } else {
                        /*
                        const model = {};
                        for ( const key in params ) {
                            set( model, key, params[key] );
                        }
                        */
                        const prevState = currState;
                        currState = newState;
                        routeChangeCallback( { currState, prevState, urlParam } );
                    }
                } else {
                    // state not found
                }
            }
        }
    }
};

/**
 * internal handler for locationChange event
 * @param event event raised by location change
 * @returns void...looks like a eslint bug for () => expr
 */
const locationChangeHandler = ( event: CustomEvent ): void => _processURL( event.detail.newURL );

/**
 * Set the window listeners to trigger the routes
 * @param autoExec - see route.start
 */
const addWindowListener = (): void => {
    history.pushState = ( f => function pushState( ...args: any[] ): unknown {
        const ret = f.apply( this, args );
        // win.dispatchEvent( new Event( 'pushstate' ) );
        win.dispatchEvent( new CustomEvent( 'locationchange', { detail: { oldURL: location.href, newURL: location.origin + args[2] } } ) );
        return ret;
    } )( history.pushState );

    history.replaceState = ( f => function replaceState( ...args: any[] ): unknown {
        const ret = f.apply( this, args );
        // win.dispatchEvent( new Event( 'replacestate' ) );
        win.dispatchEvent( new CustomEvent( 'locationchange', { detail: { oldURL: location.href, newURL: location.origin + args[2] } } ) );
        return ret;
    } )( history.replaceState );

    // instead of popstate hashchange gives the old and new url information.
    // win.addEventListener( 'popstate', () => {
    //     win.dispatchEvent( new Event( 'locationchange' ) );
    // } );

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onhashchange
    win.addEventListener( HASHCHANGE, ( e ) => {
        win.dispatchEvent( new CustomEvent( 'locationchange', { detail: { oldURL: e.oldURL, newURL: e.newURL } } ) );
    } );

    win.addEventListener( 'locationchange', locationChangeHandler );
};


/**
 * Start client router service
 */
const start = (): void => {
    if ( !_started ) {
        if ( win ) {
            if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
                addWindowListener( /*autoExec*/ );
            } else {
                document.onreadystatechange = (): void => {
                    if ( document.readyState === 'interactive' ) {
                        // the timeout is needed to solve
                        // a weird safari bug https://github.com/riot/route/issues/33
                        setTimeout( function() { addWindowListener( /*autoExec*/ ); }, 1 );
                    }
                };
            }
        }
        _started = true;
    }
};

/**
 * Stop client router service
 */
export const stop = (): void => {
    if ( _started ) {
        if ( win ) {
            // win.removeEventListener( POPSTATE, _processURL );
            win.removeEventListener( 'locationchange', locationChangeHandler );
        }
        _started = false;
    }
};

const updateState = ( transition: RouteTransition ): void => {
    // TODO: shall we support async here?
    if ( transition.prevState && transition.prevState.leave ) {
        // leave.
        transition.prevState.leave();
    }

    if ( transition.currState && transition.currState.enter ) {
        // enter
        transition.currState.enter();
    }
};

/**
 * register router element
 * @param state predefind states
 */
export const register = ( state: RouteState ): void => {
    const unInit = _routeChangeCallBacks.length === 0;
    if ( unInit ) {
        start();
    }

    // state definitions
    _states[state.id] = state;

    // onChange callbacks
    _routeChangeCallBacks.push( updateState );

    if ( unInit ) {
        // init current element
        _processURL( document.URL );
    }
};
