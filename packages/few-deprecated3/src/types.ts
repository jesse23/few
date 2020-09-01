
export interface App {
    mount: ( elem: HTMLElement ) => App;
    unmount: ( elem: HTMLElement ) => App;
}

export interface Props {
    [key: string]: any;
}

export type CreateAppFunction = ( componentDef: { ( prop: Props ): JSX.Element } ) => App;
