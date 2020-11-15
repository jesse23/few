import type { VDom, H, DefineComponentFn } from '@/types';

export const h = ( ( ...args ) => h.createElement( ...args ) ) as H;

export const setH = ( deps: VDom ): void => {
    Object.assign( h, deps );
};

/**
 * Wrapper function for JSX
 * @param componentDef componentDef
 * @returns componentDef
 *
 * Below are several different approach to achieve the functionality.
 * see https://stackoverflow.com/questions/41875350/how-to-create-a-generic-type-for-an-arrow-function-in-typescript
 *
 * - function approach
 *   export function defineComponent<T>( componentDef: ComponentDef<T> ): Component<T> {
 *       return componentDef as Component<T>;
 *   }
 *
 * - function variable approach
 *   export const defineComponent = function <T>( componentDef: ComponentDef<T> ): Component<T> {
 *       return componentDef as Component<T>;
 *   };
 *
 * - function type approach
 *   type DefineComponentFn = <T>( componentDef: ComponentDef<T> ) => Component<T>;
 *   export const defineComponent:DefineComponentFn = <T>( componentDef: ComponentDef<T> ) => ( componentDef as Component<T> );
 *   // or
 *   export const defineComponent:DefineComponentFn = ( componentDef: never ) => componentDef;
 */
export const defineComponent: DefineComponentFn = ( componentDef: never ) => componentDef;


export const AsyncH = defineComponent( {
    name: 'AsyncH',
    init: () => ( {
        content: 'loading...'
    } ),
    view: ( { content } ): JSX.Element => h( null, null, content ),
    mount: async( { fn, dispatch } ) => void dispatch( { path: 'content', value: await fn() } )
} );
