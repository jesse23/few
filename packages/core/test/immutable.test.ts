/* eslint-env jest */

import lodashSet from 'lodash/set';
import lodashFpSet from 'lodash/fp/set';
import update from 'immutability-helper';

describe( 'immutability feature test', () => {
    it( 'Assert lodash.set uses mutable approach', () => {
        const data = {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: 6
                }
            }
        };

        const res = lodashSet( data, 'child2.child21.child212', 7 );

        // verify data
         expect( data ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: 6,
                    child212: 7
                }
            }
        } );

        // verify result
        expect( res ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: 6,
                    child212: 7
                }
            }
        } );

        // verify immutability
        expect( data ).toBe( res );
        expect( data.child1 ).toBe( res.child1 );
        expect( data.child2 ).toBe( res.child2 );
        expect( data.child2.child21 ).toBe( res.child2.child21 );
    } );

    it( 'Assert lodashFp.set uses immutable approach', () => {
        const data = {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: {
                        child2111: 6
                    }
                }
            }
        };

        const res = lodashFpSet( 'child2.child21.child212', 7, data );

        // verify data
         expect( data ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: {
                        child2111: 6
                    }
                }
            }
        } );

        // verify result
        expect( res ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: {
                        child2111: 6
                    },
                    child212: 7
                }
            }
        } );

        // verify immutability
        expect( data ).not.toBe( res );
        expect( data.child1 ).toBe( res.child1 );
        expect( data.child2 ).not.toBe( res.child2 );
        expect( data.child2.child21 ).not.toBe( res.child2.child21 );
        expect( data.child2.child21.child211 ).toBe( res.child2.child21.child211 );
    } );

    it( 'Assert immutability-helper uses immutable approach (unexpected result)', () => {
        const data = {
            child1: {
                child11: 5
            },
            child2: {
                // $merge only do the 1st level replacement....
                // So all value under this child 2 will not be merged to  res
                child21: {
                    child211: 6
                },
                child22: {
                    child221: 9
                }
            }
        };

        // immutability-help.update doesn't have the ability to convert 'a.b.c', use lodashSet here
        // here for helper of helper
        const res = update( data, { $merge: lodashSet( {}, 'child2.child21.child212', 7 ) } );

        // verify data
         expect( data ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child211: 6
                },
                child22: {
                    child221: 9
                }
            }
        } );

        // verify result
        expect( res ).toEqual( {
            child1: {
                child11: 5
            },
            child2: {
                child21: {
                    child212: 7
                }
            }
        } );

        // verify immutability
        expect( data ).not.toBe( res );
        expect( data.child1 ).toBe( res.child1 );
        expect( data.child2 ).not.toBe( res.child2 );
        expect( data.child2.child21 ).not.toBe( res.child2.child21 );
    } );
} );
