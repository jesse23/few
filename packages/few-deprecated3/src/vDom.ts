import type { VDom, H } from '@/types';

export const h = ( ( ...args ) => h.createElement( ...args ) ) as H;

export const setH = ( deps: VDom ): void => {
    Object.assign( h, deps );
};
