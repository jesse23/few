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

export interface StatelessComponentDef<T> {
    name: string;
    render?: RenderFunction<T>;
    _compiled?: {
        [platform: string]: ( props: Props ) => JSX.Element;
    };
}

export interface StatefulComponentDef<T, M> extends StatelessComponentDef<M> {
    init: ( props: T ) => M;
    render?: RenderFunction<T&M>;
}

// export type Component<T, M=Props> = ComponentDef<T, M> & RenderFunction<T>;
export type Component<T, M=Props> = ( StatefulComponentDef<T, M> | StatelessComponentDef<T> ) & RenderFunction<T>;

export interface DefineComponentFn {
    <T extends Props, M=Props>( componentDef: StatefulComponentDef<T, M> ): Component<T, M>;
    <T extends Props>( componentDef: StatelessComponentDef<T> ): Component<T>;
}
