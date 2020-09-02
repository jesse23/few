import type {
    Props,
    ComponentDef,
    Component
} from '@/types';

// magical type script overload.....
export function defineComponent<T extends Props>(
    componentDef: ComponentDef<T>
): Component<T>


/**
 * Wrapper function for JSX
 * @param componentDef componentDef
 * @returns componentDef
 */
export function defineComponent<T>( componentDef: T ): T {
    return componentDef;
}

/**
 * check if type is ComponentDef. use ComponentDef.init() to detect
 * @param type component type
 * @returns true if type is component def.
 */
export const isComponent = ( type: string | Component<unknown> ): type is Component<unknown> => {
    const component = type as Component<unknown>;
    return component &&
        typeof component === 'object' &&
        // typeof componeDef.init === 'function' ||
        typeof component.render === 'function'
        // typeof componeDef.mount === 'function'
    ;
};
