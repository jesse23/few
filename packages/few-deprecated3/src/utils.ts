import type {
    ComponentDef,
    Component
} from '@/types';

/**
 * Wrapper function for JSX
 * @param componentDef componentDef
 * @returns componentDef
 *
 * Below are several different approach to achieve the functionality.
 * NOTE: define a Fn type doesn't help to hide ComponentDef since we need the 'as' for return value.
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
 */
export const defineComponent = <T, M>( componentDef: ComponentDef<T, M> ): Component<T, M> => componentDef as Component<T, M>;

/**
 * check if type is ComponentDef. use ComponentDef.init() to detect
 * @param type component type
 * @returns true if type is component def.
 */
export const isComponent = ( type: string | Component<unknown> ): type is Component<unknown> => {
    const component = type as Component<unknown>;
    return component &&
        typeof component === 'object' &&
        // typeof componentDef.init === 'function' ||
        typeof component.render === 'function'
        // typeof componentDef.mount === 'function'
    ;
};