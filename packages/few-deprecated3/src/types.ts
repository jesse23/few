/**
 * Virtual DOM
 */
type CreateElementFn = ( type: string | Component<Props>, props?: Props | null, ...children: any[] ) => JSX.Element;
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

// Action Def
export type ActionDef<T> = ( vm: T, ...args: any[] ) => void

export type ActionHandler = ( ...args: any[] ) => void

export interface ActionDefMap<T> {
    [key: string]: ActionDef<T>;
}

// Watch
export interface Watcher {
    action: ( event?: unknown ) => void;
    when?: boolean;
    watch?: unknown;
}

export type WatchersDef<T> = ( vm: T, ...args: any[] ) => Watcher[]

export interface StatelessComponentDef<T> {
    name: string;
    view?: RenderFunction<T>;
    _compiled?: {
        [platform: string]: ( props: Props ) => JSX.Element;
    };
    mount?: ActionDef<T>;
    unmount?: ActionDef<T>;
}

export interface StatefulComponentDef<T, M> extends StatelessComponentDef<M> {
    init: ( props: T ) => M|Promise<M>;
    view?: RenderFunction<T&M>;
    actions?: ActionDefMap<T&M>;
    mount?: ActionDef<T&M>;
    unmount?: ActionDef<T&M>;
    watchers?: WatchersDef<T&M>;
}

// export type Component<T, M=Props> = ComponentDef<T, M> & RenderFunction<T>;
export type ComponentDef<T, M=Props> = StatefulComponentDef<T, M> | StatelessComponentDef<T>;
export type Component<T, M=Props> = ComponentDef<T, M> & RenderFunction<T>;

export interface DefineComponentFn {
    <T extends Props, M=Props>( componentDef: StatefulComponentDef<T, M> ): Component<T, M>;
    <T extends Props>( componentDef: StatelessComponentDef<T> ): Component<T>;
}

// dispatch input
export interface DispatchInput {
    path: string;
    value: unknown;
}

export interface Ref {
    ( key: string ): ( el: HTMLElement ) => void;
    [key: string]: HTMLElement;
}
