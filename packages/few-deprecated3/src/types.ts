/**
 * Virtual DOM
 */
type CreateElementFn = ( type: string | Component<Props>, props?: Props | null, ...children: JSX.Element[] ) => JSX.Element;
export interface VDom {
    type: string;
    createElement: CreateElementFn;
    createComponent: ( component: Component<Props> ) => { ( props: Props ): JSX.Element };
    Fragment: Function;
}

export type H = CreateElementFn & VDom;

/**
 * App - will merge with component instance later
 */
export interface App {
    mount: ( elem: HTMLElement ) => App;
    unmount: ( elem: HTMLElement ) => App;
}

export type CreateAppFunction<T=Props> = ( componentDef: Component<T> ) => App;

/**
 * Component
 */
export interface Props {
    [key: string]: any;
}

export interface RenderFunction<T> {
    ( props: T ): JSX.Element;
    displayName?: string;
}

export interface ComponentDef<T, M> {
    name: string;
    init?: ( props: T ) => M;
    render?: RenderFunction<M&Props>;
    _compiled?: {
        [platform: string]: ( props: T ) => JSX.Element;
    };
}

export type Component<T, M=Props> = ComponentDef<T, M> & RenderFunction<T>;
