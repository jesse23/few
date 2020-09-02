
export interface App {
    mount: ( elem: HTMLElement ) => App;
    unmount: ( elem: HTMLElement ) => App;
}

export interface Props {
    [key: string]: any;
}

export type CreateAppFunction = ( componentDef: { ( prop: Props ): JSX.Element } ) => App;

///////////////

type CreateElementFn = ( ...args: any[] ) => JSX.Element;
export interface VDom {
    type: string;
    createElement: CreateElementFn;
    Fragment: Function;
}

export type H = CreateElementFn & VDom;
