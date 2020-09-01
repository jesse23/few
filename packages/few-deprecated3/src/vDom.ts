

type ArgArray<T=any> = [T, ...T[]];

// eslint-disable-next-line react/display-name
export const h = ( ...args: ArgArray ): JSX.Element => h.createElement( ...args );
h.createElement = undefined as { ( ...args: any[] ): JSX.Element };
/*
h.type = undefined as string;
h.Fragment = undefined as Function;
*/

export const setH = ( deps: any ): void => {
    Object.assign( h, deps );
};
