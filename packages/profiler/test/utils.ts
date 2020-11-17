/* eslint-env jest */
let _mockTimerEnabled = false;

export const useMockTimer = ( fn: Function ): void => {
    beforeEach( () => {
        _mockTimerEnabled = true;
        jest.useFakeTimers();
        fn();
    } );

    afterEach( () => {
        _mockTimerEnabled = false;
        fn();
    } );
};

/**
 * wait for elapsed time and return a promise
 * Note: act is react-dom/jest specific but harmless to other framework
 *
 * @param elapsed elapsed time
 * @param mockReact if true use act API to mock react async call
 * @returns promise
 */
export const wait = ( elapsed = 0 ): Promise<void> => {
    const callback = (): Promise<void> => {
        if ( _mockTimerEnabled ) {
            jest.advanceTimersByTime( elapsed );
            return Promise.resolve();
        }

        // real timer
        return new Promise( resolve => setTimeout( resolve, elapsed ) );
    };
    return callback();
};

