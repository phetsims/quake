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
    25,
    500,
    25,
    100,
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
    25,
    500,
    25,
    100,
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
    logger.log( 'Multi clicks button pressed' );
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

  const buzzIntensitySlider = new ParameterSlider(
    'buzz-intensity-slider',
    0.1,
    1,
    0.1,
    1,
    'Buzz Intensity'
  );

  const buzzDurationSlider = new ParameterSlider(
    'buzz-duration-slider',
    200,
    2000,
    25,
    500,
    'Buzz Duration',
    'ms'
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
  // Set up the "Patterns" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const patternElementIntensitySlider = new ParameterSlider(
    'pattern-element-intensity-slider',
    0,
    1,
    0.1,
    1,
    'Intensity'
  );

  const patternElementDurationSlider = new ParameterSlider(
    'pattern-element-duration-slider',
    50,
    1000,
    50,
    100,
    'Duration',
    'ms'
  );

  const patternDisplay = new VibrationPatternDisplay( 'pattern-canvas', 'pattern-canvas-label' );

  // The pattern that is constructed by the user and played when the "Play Pattern" button is pressed.  It is an array
  // vibration specs.
  const pattern = [];

  const addPatternElementButton = document.getElementById( 'add-to-pattern-button' );
  addPatternElementButton.addEventListener( 'click', () => {

    // Create a new vibration spec based on the current values of the intensity and duration sliders.
    const vibrationSpec = nativeVibration.createVibrationSpec(
      patternElementDurationSlider.value / 1000,
      patternElementIntensitySlider.value
    );

    // Add the new vibration spec to the pattern.
    pattern.push( vibrationSpec );
    // TODO: At some point the code should be a little more picky about what it accepts as a valid pattern, since some
    //       things don't really make sense, such as starting a pattern with a zero intensity value, or having two
    //       consecutive elements with the same intensity.  See https://github.com/phetsims/quake/issues/9.

    // Render the pattern.
    patternDisplay.clear();
    patternDisplay.renderPattern( pattern );
  } );

  const clearPatternElementButton = document.getElementById( 'clear-pattern-button' );
  clearPatternElementButton.addEventListener( 'click', () => {
    pattern.length = 0;
    patternDisplay.clear();

    // Stop any vibration that is in progress.
    nativeVibration.cancel( NOOP, ALERT_ERROR );
  } );

  const repeatCheckbox = document.getElementById( 'repeat-checkbox' );
  repeatCheckbox.addEventListener( 'click', () => {

    // If there is a vibration already in progress when this is changed, cancel it.
    nativeVibration.cancel( NOOP, ALERT_ERROR );
  } );

  const playPatternButton = document.getElementById( 'play-pattern' );
  playPatternButton.addEventListener( 'click', () => {
    nativeVibration.vibrate( NOOP, ALERT_ERROR, pattern, repeatCheckbox.checked );
  } );

  const stopPatternButton = document.getElementById( 'stop-pattern' );
  stopPatternButton.addEventListener( 'click', () => {
    nativeVibration.cancel( NOOP, ALERT_ERROR );
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
        page.style.display = 'flex';
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

/**
 * VibrationPatternDisplay portrays a vibration pattern that consists of vibrations, shown as sine waves, and spaces.
 * It is essentially a graph with time on the X axis.
 */
class VibrationPatternDisplay {

  /**
   * @param {string} canvasID - ID of the HTML canvas element that will be used to display the pattern.
   * @param {string} labelID - ID of the label for the dispaly.
   */
  constructor( canvasID, labelID ) {

    // @private {HTMLCanvas}
    this.canvas = document.getElementById( canvasID );
    assert( this.canvas, 'canvas not found' );

    // @private {HTMLLabel}
    this.label = document.getElementById( labelID );
    assert( this.label, 'label not found' );

    // @private - constants used for rendering
    this.sineWaveFrequency = 80; // in Hz
    this.pixelsPerWaveSegment = 1;

    // Set up the initial display.
    this.updateLabel( 0 );

    this.maxPatternAmplitude = this.canvas.height * 0.45;
  }

  /**
   * Clear whatever is currently displayed.
   * @public
   */
  clear( providedContext ) {
    const context = providedContext || this.canvas.getContext( '2d' );
    context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    this.updateLabel( 0 );
  }

  /**
   * Draw the provided pattern into the display.
   * @param {VibrationSpec[]} pattern
   * @public
   */
  renderPattern( pattern ) {

    const context = this.canvas.getContext( '2d' );

    // Clear out the old stuff.
    this.clear( context );

    // Start a new path
    context.beginPath();

    // Calculate the total duration of the pattern.
    const totalPatternDuration = pattern.reduce(
      ( totalDurationSoFar, vibrationSpec ) => totalDurationSoFar + vibrationSpec.duration,
      0
    );

    // Calculate the amount of time represented per pixel for rendering this pattern.
    const secondsPerPixel = totalPatternDuration / this.canvas.width;

    // running x position value
    let xPos = 0;

    // other useful value for rendering
    const centerY = this.canvas.height / 2;

    pattern.forEach( vibrationSpec => {

      const patternElementLengthInPixels = vibrationSpec.duration / secondsPerPixel;

      if ( vibrationSpec.intensity === 0 ) {

        // The intensity is zero, to this is essentially a pause.  Draw a line for this duration.
        context.moveTo( xPos, centerY );
        xPos += patternElementLengthInPixels;
        context.lineTo( xPos, centerY );
      }
      else {

        // The intensity is greater than zero, so we need to draw a sine wave.  First calculate the number of cycles.
        // This is set to an integer value so that the patterns will look good.
        const numberOfCycles = Math.round( this.sineWaveFrequency * vibrationSpec.duration );

        for ( let patternElementXPos = 0;
              patternElementXPos < patternElementLengthInPixels;
              patternElementXPos += this.pixelsPerWaveSegment ) {

          // Draw the next small segment of the sine wave that represents the vibration.
          context.lineTo(
            xPos,
            centerY + this.maxPatternAmplitude * vibrationSpec.intensity * Math.sin( Math.PI * 2 * numberOfCycles * ( patternElementXPos / patternElementLengthInPixels ) )
          );
          xPos += this.pixelsPerWaveSegment;
        }
      }

      context.stroke();
    } );

    this.updateLabel( totalPatternDuration );
  }

  /**
   * Update the label for the pattern display.
   * @param {number} totalDuration - total duration of the pattern in seconds
   * @private
   */
  updateLabel( totalDuration ) {
    this.label.innerText = `Pattern (total duration = ${( totalDuration * 1000 ).toFixed( 0 )} ms):`;
  }
}
