// Copyright 2021, University of Colorado Boulder

/**
 * Main entry point for the Cordova-based Haptics Playground app.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// Wait for the deviceready event before using any of Cordova's device APIs. See
// https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener( 'deviceready', onDeviceReady, false );

class ScreenDebugLogger {

  constructor() {
    this.debugArea = document.getElementById( 'debugArea' );
    this.timeOfConstruction = Date.now();

    // @private {Array.<string>} - an array that holds the currently displayed messages
    this.messageBuffer = [];
  }

  /**
   * log a message
   * @public
   */
  log( message ) {
    const maxMessages = 5;
    if ( this.messageBuffer.length >= maxMessages ) {
      this.messageBuffer.pop();
    }
    const messageWithTimestamp = ( ( Date.now() - this.timeOfConstruction ) / 1000 ).toFixed( 3 ) + ': ' + message; // eslint-disable-line bad-sim-text
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
}

/**
 * This handler function is called when Cordova is fully loaded.  In it, all the behavior that is specific to the
 * Haptics Playground app is set up.
 */
function onDeviceReady() {
  console.log( 'Running cordova-' + cordova.platformId + '@' + cordova.version ); // eslint-disable-line
  document.getElementById( 'deviceready' ).classList.add( 'ready' );

  // Create the logger that will output debug messages to the app's screen.
  const logger = new ScreenDebugLogger();

  // Hook up the vibration button.
  const vibrateButton = document.getElementById( 'vibrateButton' );
  vibrateButton.addEventListener( 'click', () => {
    logger.log( 'vibrate button pressed' );
    try {
      navigator.vibrate( 100 );
      logger.log( 'vibrate called' );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );
}
