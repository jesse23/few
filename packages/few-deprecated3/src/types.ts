
/**
 * Virtual DOM
 */
type CreateElementFn = ( ...args: any[] ) => JSX.Element;
export interface VDom {
    type: string;
    createElement: CreateElementFn;
    createComponent?: Function;
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

export type RenderFunction<T = Props> = ( props: T ) => JSX.Element;

export interface ComponentDef<T = Props> {
    render?: RenderFunction<T>;
    _compiled?: {
        [platform: string]: ( props: Props ) => JSX.Element;
    };
}

export type Component<T> = ComponentDef<T> & RenderFunction<T>;


