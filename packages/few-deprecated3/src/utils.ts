import type {
    ComponentDef,
    DefineComponentFn,
    StatefulComponentDef
} from '@/types';

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
