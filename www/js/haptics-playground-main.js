// Copyright 2022, University of Colorado Boulder

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

  // startup message
  console.log( `Running cordova-${cordova.platformId}@${cordova.version}` );

  // Create the logger that will output debug messages to the app's screen.
  const logger = new ScreenDebugLogger();

  // Hook up the buttons.
  const singleClickButton = document.getElementById( 'singleClickButton' );
  singleClickButton.addEventListener( 'click', () => {
    logger.log( 'single click button pressed' );
    try {
      navigator.vibrate( 10 );
    }
    catch( e ) {
      logger.log( 'error when trying to call bump: ' + e );
    }
  } );

  const doubleClickButton = document.getElementById( 'doubleClickButton' );
  doubleClickButton.addEventListener( 'click', () => {
    logger.log( 'double button pressed' );
    try {
      navigator.vibrate( 100 );
    }
    catch( e ) {
      logger.log( 'error when trying to call shortVibration: ' + e );
    }
  } );

  const nClicksButton = document.getElementById( 'nClicksButton' );
  nClicksButton.addEventListener( 'click', () => {
    logger.log( 'N clicks button pressed' );
    try {
      navigator.vibrate( 400 );
    }
    catch( e ) {
      logger.log( 'error when trying to call longerVibration: ' + e );
    }
  } );

  // Get a local reference to the global device object so that we only have to disable lint for one line.
  const thisDevice = nativeVibration; // eslint-disable-line

  // Hook up handlers for the navigation bar buttons.
  const clicksNavBarButton = document.getElementById( 'clicks' );
  clicksNavBarButton.addEventListener( 'click', () => {
    alert( 'Clicks nav bar button pressed' );
  } );
  const buzzesNavBarButton = document.getElementById( 'buzzes' );
  buzzesNavBarButton.addEventListener( 'click', () => {
    alert( 'Buzzes nav bar button pressed' );
  } );
  const patternsNavBarButton = document.getElementById( 'patterns' );
  patternsNavBarButton.addEventListener( 'click', () => {
    alert( 'Patterns nav bar button pressed' );
  } );
}
