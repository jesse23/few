/**
 * Get current timestamp
 *
 * @returns current timestamp as number
 */
export const now = (): number => {
    if ( window && window.performance ) {
        return window.performance.now();
    }
    return Date.now();
};
