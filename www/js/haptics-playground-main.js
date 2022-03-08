// Copyright 2022, University of Colorado Boulder

/**
 * Main entry point for the Cordova-based Haptics Playground app.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenDebugLogger from './ScreenDebugLogger.js';

// constants
const NOOP = () => {};
const ALERT_ERROR = e => { alert( `Error: ${e}` ); };

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

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the "Clicks" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const clickDurationSlider = new ParameterSlider(
    'click-duration-slider',
    50,
    500,
    25,
    200,
    'Click Duration',
    'ms'
  );

  const clickIntensitySlider = new ParameterSlider(
    'click-intensity-slider',
    0.1,
    1,
    0.1,
    1,
    'Click Intensity'
  );

  const interClickTimeSlider = new ParameterSlider(
    'inter-click-time-slider',
    50,
    500,
    25,
    200,
    'Inter-Click Time'
  );

  // Hook up the buttons for the "Clicks" screen.
  const singleClickButton = document.getElementById( 'singleClickButton' );
  singleClickButton.addEventListener( 'click', () => {
    logger.log( 'single click button pressed' );
    try {
      nativeVibration.vibrateOnce(
        NOOP,
        ALERT_ERROR,
        clickDurationSlider.value / 1000,
        clickIntensitySlider.value
      );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );

  const doubleClickButton = document.getElementById( 'doubleClickButton' );
  doubleClickButton.addEventListener( 'click', () => {
    logger.log( 'double button pressed' );
    try {
      nativeVibration.vibrateDoubleClick(
        NOOP,
        ALERT_ERROR,
        clickDurationSlider.value / 1000,
        clickIntensitySlider.value,
        interClickTimeSlider.value / 1000
      );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );

  const numberOfClicksInput = document.getElementById( 'number-of-clicks' );
  numberOfClicksInput.value = 3;
  const multiClicksButton = document.getElementById( 'multi-clicks-button' );
  multiClicksButton.addEventListener( 'click', () => {
    logger.log( 'N clicks button pressed' );
    try {
      const vibrationSpecList = [];
      for ( let i = 0; i < numberOfClicksInput.value; i++ ) {
        vibrationSpecList.push(
          nativeVibration.createVibrationSpec( clickDurationSlider.value / 1000, clickIntensitySlider.value )
        );
        if ( i !== numberOfClicksInput.value - 1 ) {
          vibrationSpecList.push(
            nativeVibration.createVibrationSpec( interClickTimeSlider.value / 1000, 0 )
          );
        }
      }
      nativeVibration.vibrate( NOOP, ALERT_ERROR, vibrationSpecList );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the "Buzzes" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const buzzDurationSlider = new ParameterSlider(
    'buzz-duration-slider',
    50,
    500,
    25,
    200,
    'Buzz Duration',
    'ms'
  );

  const buzzIntensitySlider = new ParameterSlider(
    'buzz-intensity-slider',
    0.1,
    1,
    0.1,
    1,
    'Buzz Intensity'
  );

  const buzzButton = document.getElementById( 'buzzButton' );
  buzzButton.addEventListener( 'click', () => {
    logger.log( 'buzz button pressed' );
    try {
      nativeVibration.vibrateOnce(
        NOOP,
        ALERT_ERROR,
        buzzDurationSlider.value / 1000,
        buzzIntensitySlider.value
      );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );

  //--------------------------------------------------------------------------------------------------------------------
  // nav bar
  //--------------------------------------------------------------------------------------------------------------------

  // Map of the nav bar button IDs to the screens with which each is associated.
  const navBarButtonIdToScreenIdMap = new Map();
  navBarButtonIdToScreenIdMap.set( 'clicks', 'clicks-page' );
  navBarButtonIdToScreenIdMap.set( 'buzzes', 'buzzes-page' );
  navBarButtonIdToScreenIdMap.set( 'patterns', 'patterns-page' );

  // Define a function that will highlight the button and show only the selected screen.
  const selectButtonAndScreen = buttonID => {
    navBarButtonIdToScreenIdMap.forEach( ( value, key ) => {
      const page = document.getElementById( value );
      const button = document.getElementById( key );
      if ( key === buttonID ) {
        page.style.display = 'block';
        button.classList.add( 'selected' );
      }
      else {
        page.style.display = 'none';
        button.classList.remove( 'selected' );
      }
    } );
  };

  // Set the initially selected button.
  selectButtonAndScreen( 'clicks' );

  // Define a handler that can be used for each of the nav bar buttons.
  const handleNavBarButtonClick = event => {
    selectButtonAndScreen( event.currentTarget.id );
  };

  // Hook up handlers for each of the nav bar buttons.
  Array.from( navBarButtonIdToScreenIdMap.keys() ).forEach( key => {
    document.getElementById( key ).addEventListener( 'click', handleNavBarButtonClick );
  } );
}

/**
 * simple assertion function, aids in debugging
 */
const assert = ( conditional, message ) => {
  if ( !conditional ) {
    alert( message );
    throw new Error( message );
  }
};

/**
 * ParameterSlider defines the behavior for a slider that controls a numeric parameter.  There must be a corresponding
 * element in the HTML document.
 */
class ParameterSlider {

  constructor( id, minValue, maxValue, step, initialValue, textualLabel, units = '' ) {

    // parameter checking
    assert( initialValue >= minValue && initialValue <= maxValue, 'unusable initial value' );
    const inputSlider = document.getElementById( id );
    assert( inputSlider, `no slider found for id ${id}` );

    // Set up the slider.
    inputSlider.min = minValue;
    inputSlider.max = maxValue;
    inputSlider.step = step;
    inputSlider.value = initialValue;

    // Update the label on the slider when values change.
    const label = document.getElementById( `${id}-label` );
    const updateSliderLabel = () => {
      label.innerHTML = `${textualLabel}: ${inputSlider.value} ${units}`;
    };
    updateSliderLabel();
    inputSlider.oninput = updateSliderLabel;

    // Make the input slider available to the methods.
    this.inputSlider = inputSlider;
  }

  get value() {
    return this.inputSlider.value;
  }
}
