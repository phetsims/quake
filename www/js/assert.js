// Copyright 2022, University of Colorado Boulder

/**
 * simple assertion function, aids in debugging
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
const assert = ( conditional, message ) => {
  if ( !conditional ) {
    alert( message );
    throw new Error( message );
  }
};

export default assert;