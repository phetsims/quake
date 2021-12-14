// Copyright 2021, University of Colorado Boulder

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener( 'deviceready', onDeviceReady, false );

class ScreenDebugLogger {

  constructor() {
    this.debugArea = document.getElementById( 'debugArea' );

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
      this.messageBuffer.shift();
    }
    this.messageBuffer.push( message );
    let messageText = '';
    this.messageBuffer.forEach( ( message, index ) => {
      messageText += message;
      if ( index < this.messageBuffer.length - 1 ) {
        messageText += '<br>';
      }
      this.debugArea.innerHTML = messageText;
    } );
  }
}

/**
 * This handler function is called when Cordova is fully loaded.  In it, all of the behavior that is specific to the
 * Haptics Playground app is set up.
 */
function onDeviceReady() {
  console.log( 'Running cordova-' + cordova.platformId + '@' + cordova.version ); // eslint-disable-line
  document.getElementById( 'deviceready' ).classList.add( 'ready' );

  const logger = new ScreenDebugLogger();
  logger.log( 'device ready' );
  logger.log( 'message 1' );
  logger.log( 'message 2' );
  logger.log( 'message 3' );
  logger.log( 'message 4' );
  logger.log( 'message 5' );
}
