import type {
    ComponentDef,
    DefineComponentFn,
    StatefulComponentDef
} from '@/types';

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

/**
 * check if type is Component
 * @param type component type
 * @returns true if type is component def.
 */
export const isComponent = ( type: string | ComponentDef<never> ): type is ComponentDef<never> => {
    const component = type as ComponentDef<never>;
    return component &&
        // typeof component === 'object' &&
        (
            typeof ( component as StatefulComponentDef<never, never> ).init === 'function' ||
            typeof component.view === 'function'
        );
        // typeof componentDef.mount === 'function'
};

/**
 * check if type is ComponentDef. use ComponentDef.init() to detect
 * @param type component type
 * @returns true if type is component def.
 */
export const isStatefulComponent = <T, M>( type: string | ComponentDef<T> ): type is StatefulComponentDef<T, M> => {
    const component = type as StatefulComponentDef<T, M>;
    return component &&
        // typeof component === 'object' &&
        typeof component.init === 'function';
};

/**
 * check if type is ComponentDef. use ComponentDef.init() to detect
 * @param value component type
 * @returns true if type is promise.
 */
export const isPromise = ( value: unknown ): value is Promise<unknown> => {
    const val = value as Promise<unknown>;
    return val && val.then && typeof val.then === 'function';
};

/**
 * wait for elapsed time and return a promise
 * @param elapsed elapsed time
 * @returns promise
 */
export const wait = ( elapsed = 0 ): Promise<{}> =>
    new Promise( resolve => setTimeout( () => resolve( null ), elapsed ) );
