// Copyright 2021, University of Colorado Boulder

/**
 * Main entry point for the Cordova-based Haptics Playground app.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenDebugLogger from './ScreenDebugLogger.js';

// Wait for the deviceready event before using any of Cordova's device APIs. See
// https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener( 'deviceready', onDeviceReady, false );

/**
 * This handler function is called when Cordova is fully loaded.  In it, all the behavior that is specific to the
 * Haptics Playground app is set up.
 */
function onDeviceReady() {
  console.log( 'Running cordova-' + cordova.platformId + '@' + cordova.version ); // eslint-disable-line
  document.getElementById( 'deviceready' ).classList.add( 'ready' );

  // Create the logger that will output debug messages to the app's screen.
  const logger = new ScreenDebugLogger();

  // Hook up the buttons.
  const bumpButton = document.getElementById( 'bumpButton' );
  bumpButton.addEventListener( 'click', () => {
    logger.log( 'bump button pressed' );
    try {
      navigator.vibrate( 10 );
    }
    catch( e ) {
      logger.log( 'error when trying to call bump: ' + e );
    }
  } );

  const shortVibrationButton = document.getElementById( 'shortVibrationButton' );
  shortVibrationButton.addEventListener( 'click', () => {
    logger.log( 'shortVibration button pressed' );
    try {
      navigator.vibrate( 100 );
    }
    catch( e ) {
      logger.log( 'error when trying to call shortVibration: ' + e );
    }
  } );

  const longerVibrationButton = document.getElementById( 'longerVibrationButton' );
  longerVibrationButton.addEventListener( 'click', () => {
    logger.log( 'longerVibration button pressed' );
    try {
      navigator.vibrate( 400 );
    }
    catch( e ) {
      logger.log( 'error when trying to call longerVibration: ' + e );
    }
  } );

  const pulseButton = document.getElementById( 'pulseButton' );
  pulseButton.addEventListener( 'click', () => {
    logger.log( 'pulse button pressed' );
    try {
      navigator.vibrate( [ 200, 200, 200, 200 ] );
    }
    catch( e ) {
      logger.log( 'error when trying to call pulse: ' + e );
    }
  } );

  // Get a local reference to the global device object so that we only have to disable lint for one line.
  const thisDevice = device; // eslint-disable-line

  const deviceButton = document.getElementById( 'deviceButton' );
  deviceButton.addEventListener( 'click', () => {

    // Invoke a method on the object created by the plugin.
    thisDevice.getInfo(
      info => { console.log( `info = ${info}` ); },
      error => { console.log( `error = ${error}` ); }
    );

    try {
      logger.log( `model = ${thisDevice.model}` );
      logger.log( `platform = ${thisDevice.platform}` );
      logger.log( `version = ${thisDevice.version}` );
      logger.log( `manufacturer = ${thisDevice.manufacturer}` );
    }
    catch( e ) {
      logger.log( 'error when trying to access device.model: ' + e );
    }
  } );
}
