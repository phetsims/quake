// Copyright 2022, University of Colorado Boulder

/**
 * EnhancedVibration provides an API to haptic vibration capabilities that is, to some extent, cross platform.  It also
 * provides other capabilities that support the vibration feature, such as playing a sound to accompany the vibration
 * patterns.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

class EnhancedVibration {

  constructor() {
    this.message = 'Well hello there.';
  }

  /**
   * log the message
   * @public
   */
  logMessage() {
    console.log( this.message );
  }

}


export default EnhancedVibration;