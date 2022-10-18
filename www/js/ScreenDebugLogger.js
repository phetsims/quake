// Copyright 2021, University of Colorado Boulder

/**
 * ScreenDebugLogger is an object that can be used to log messages directly to the screen.  This can be useful when the
 * console is unavailable or hard to get to.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// constants
const MAX_MESSAGES = 5;
const MODE = 'console'; // Valid modes are 'screen' and 'console'.

class ScreenDebugLogger {

  constructor() {
    this.debugArea = document.getElementById( 'debugArea' );
    this.timeOfConstruction = Date.now();

    // Hide the debug area if this is just being logged to the console.
    if ( MODE !== 'screen' ) {
      this.debugArea.style.visibility = 'hidden';
    }

    // @private {Array.<string>} - an array that holds the currently displayed messages
    this.messageBuffer = [];
  }

  /**
   * log a message
   * @public
   */
  log( message ) {
    const messageWithTimestamp = ( ( Date.now() - this.timeOfConstruction ) / 1000 ).toFixed( 3 ) + ': ' + message;
    if ( MODE === 'screen' ) {
      if ( this.messageBuffer.length >= MAX_MESSAGES ) {
        this.messageBuffer.pop();
      }
      this.messageBuffer.unshift( messageWithTimestamp );
      let debugAreaHTML = '';
      this.messageBuffer.forEach( ( message, index ) => {
        debugAreaHTML += message;
        if ( index < this.messageBuffer.length - 1 ) {
          debugAreaHTML += '<br>';
        }
      } );
      this.debugArea.innerHTML = debugAreaHTML;
    }
    else {
      console.log( messageWithTimestamp );
    }
  }
}


export default ScreenDebugLogger;