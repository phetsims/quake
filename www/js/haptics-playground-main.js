// Copyright 2022, University of Colorado Boulder

/**
 * Main entry point for the Cordova-based Haptics Playground app.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenDebugLogger from './ScreenDebugLogger.js';
import EnhancedVibration from './EnhancedVibration.js';

// Create the logger that will output debug messages to the app's screen.
const logger = new ScreenDebugLogger();

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

  // Create the object that will be used to create and control haptic vibrations.
  const vibration = new EnhancedVibration();

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the "Clicks" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const clickDurationSlider = new ParameterSlider(
    'click-duration-slider',
    25,
    500,
    25,
    75,
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
    75,
    'Inter-Click Time'
  );

  // Hook up the buttons for the "Clicks" screen.
  const singleClickButton = document.getElementById( 'singleClickButton' );
  singleClickButton.addEventListener( 'click', () => {
    vibration.vibrateOnce( clickDurationSlider.value / 1000, clickIntensitySlider.value );
  } );

  const doubleClickButton = document.getElementById( 'doubleClickButton' );
  doubleClickButton.addEventListener( 'click', () => {
    vibration.vibrateDoubleClick(
      clickDurationSlider.value / 1000,
      clickIntensitySlider.value,
      interClickTimeSlider.value / 1000
    );
  } );

  // Set up the input for the number of clicks that will be played by the "multi clicks" button.
  const numberOfClicksInput = document.getElementById( 'number-of-clicks' );
  numberOfClicksInput.value = 3; // initial value
  numberOfClicksInput.addEventListener( 'input', () => {
    const inputValueAsNumber = parseInt( numberOfClicksInput.value, 10 );
    if ( inputValueAsNumber > 9 ) {
      numberOfClicksInput.value = 9;
    }
    else if ( inputValueAsNumber < 1 ) {
      numberOfClicksInput.value = 1;
    }
  } );

  // Set up the multi-clicks button.
  const multiClicksButton = document.getElementById( 'multi-clicks-button' );
  multiClicksButton.addEventListener( 'click', () => {
    try {
      const vibrationSpecList = [];
      for ( let i = 0; i < numberOfClicksInput.value; i++ ) {
        vibrationSpecList.push(
          vibration.createVibrationSpec( clickDurationSlider.value / 1000, clickIntensitySlider.value )
        );
        if ( i !== numberOfClicksInput.value - 1 ) {
          vibrationSpecList.push(
            vibration.createVibrationSpec( interClickTimeSlider.value / 1000, 0 )
          );
        }
      }
      vibration.vibrate( vibrationSpecList );
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
    try {
      vibration.vibrateOnce( buzzDurationSlider.value / 1000, buzzIntensitySlider.value );
    }
    catch( e ) {
      logger.log( 'error when trying to call vibrate: ' + e );
    }
  } );

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the "Patterns" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const vibrationIntensitySlider = new ParameterSlider(
    'vibration-intensity-slider',
    0,
    1,
    0.1,
    1,
    'Intensity'
  );

  const vibrationDurationSlider = new ParameterSlider(
    'vibration-duration-slider',
    50,
    1000,
    50,
    100,
    'Duration',
    'ms'
  );

  const spaceDurationSlider = new ParameterSlider(
    'space-duration-slider',
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

  const addVibrationToPatternButton = document.getElementById( 'add-vibration-to-pattern-button' );
  addVibrationToPatternButton.addEventListener( 'click', () => {

    const vibrationDuration = vibrationDurationSlider.value / 1000;
    const vibrationIntensity = vibrationIntensitySlider.value;

    if ( pattern.length > 0 && pattern[ pattern.length - 1 ].intensity === vibrationIntensity ) {

      // This new vibration is at the same intensity as the previous one, so just extend the previous one instead of
      // adding another element.
      pattern[ pattern.length - 1 ].duration += vibrationDuration;
    }
    else {

      // Create a new vibration spec and add it to the pattern array.
      const vibrationSpec = vibration.createVibrationSpec( vibrationDuration, vibrationIntensity );
      pattern.push( vibrationSpec );
    }

    // Update the pattern display.
    patternDisplay.clear();
    patternDisplay.renderPattern( pattern );
  } );

  const addSpaceToPatternButton = document.getElementById( 'add-space-to-pattern-button' );
  addSpaceToPatternButton.addEventListener( 'click', () => {

    const spaceDuration = spaceDurationSlider.value / 1000;

    if ( pattern.length > 0 && pattern[ pattern.length - 1 ].intensity === 0 ) {

      // The last pattern element was already a space, so just lengthen it rather than adding a new element.
      pattern[ pattern.length - 1 ].duration += spaceDuration;
    }
    else {

      // Create a new space spec and add it to the pattern.
      const vibrationSpec = vibration.createVibrationSpec( spaceDurationSlider.value / 1000, 0 );
      pattern.push( vibrationSpec );
    }

    // Update the pattern display.
    patternDisplay.clear();
    patternDisplay.renderPattern( pattern );
  } );

  const clearPatternElementButton = document.getElementById( 'clear-pattern-button' );
  clearPatternElementButton.addEventListener( 'click', () => {
    pattern.length = 0;
    patternDisplay.clear();

    // Stop any vibration that is in progress.
    vibration.cancel();
  } );

  const repeatCheckbox = document.getElementById( 'repeat-checkbox' );
  repeatCheckbox.addEventListener( 'click', () => {

    // If there is a vibration already in progress when this is changed, cancel it.
    vibration.cancel();
  } );

  const playPatternButton = document.getElementById( 'play-pattern' );
  playPatternButton.addEventListener( 'click', () => {
    if ( pattern.length > 0 ) {
      vibration.vibrate( pattern, repeatCheckbox.checked );
    }
  } );

  const stopPatternButton = document.getElementById( 'stop-pattern' );
  stopPatternButton.addEventListener( 'click', () => {
    vibration.cancel();
  } );

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the "Settings" screen.
  //--------------------------------------------------------------------------------------------------------------------

  const soundEnabledCheckbox = document.getElementById( 'sound-enabled-checkbox' );
  soundEnabledCheckbox.checked = vibration.soundEnabled;
  soundEnabledCheckbox.addEventListener( 'click', () => {
    vibration.soundEnabled = soundEnabledCheckbox.checked;
  } );

  // Add app and version information.
  const versionInfoParagraph = document.getElementById( 'version-info' );
  const versionInfo = {};
  cordova.getAppVersion.getVersionNumber().then( versionNumber => {
    versionInfo.versionNumber = versionNumber;
    cordova.getAppVersion.getPackageName( packageName => {
      versionInfo.packageName = packageName;
      cordova.getAppVersion.getAppName( appName => {
        versionInfo.appName = appName;
        versionInfoParagraph.innerHTML = `App Name: ${versionInfo.appName}<br>` +
                                         `Package Name: ${versionInfo.packageName}<br>` +
                                         `Version: ${versionInfo.versionNumber}`;
      } );
    } );
  } );

  //--------------------------------------------------------------------------------------------------------------------
  // Set up the nav bar.
  //--------------------------------------------------------------------------------------------------------------------

  // Map of the nav bar button IDs to the screens with which each is associated.
  const navBarButtonIdToScreenIdMap = new Map();
  navBarButtonIdToScreenIdMap.set( 'clicks', 'clicks-screen' );
  navBarButtonIdToScreenIdMap.set( 'buzzes', 'buzzes-screen' );
  navBarButtonIdToScreenIdMap.set( 'patterns', 'patterns-screen' );
  navBarButtonIdToScreenIdMap.set( 'settings', 'settings-screen' );

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

  //--------------------------------------------------------------------------------------------------------------------
  // Add a handler to the header to display version information.
  //--------------------------------------------------------------------------------------------------------------------

  document.getElementById( 'image-container' ).addEventListener( 'dblclick', () => {
    cordova.getAppVersion.getVersionNumber().then( versionNumber => {
      alert( `version number ${versionNumber}` );
    } );
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
    context.fillStyle = '#333333';

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

    // Set the starting position for the rendering of the pattern.
    context.lineTo( xPos, centerY );

    // Render the various segments of the pattern.
    pattern.forEach( vibrationSpec => {

      const patternElementLengthInPixels = vibrationSpec.duration / secondsPerPixel;

      if ( vibrationSpec.intensity === 0 ) {

        // The intensity is zero, to this is essentially a pause.  Draw a line for this duration.
        context.lineTo( xPos, centerY );
        xPos += patternElementLengthInPixels;
        context.lineTo( xPos, centerY );
      }
      else {

        // The intensity is greater than zero.  If there is sufficient space to do so, a sine wave will be drawn.  If
        // not, a filled rectangle will be rendered.

        const numberOfSineWaveCycles = Math.round( this.sineWaveFrequency * vibrationSpec.duration );
        const pixelsPerCycle = vibrationSpec.duration / secondsPerPixel / numberOfSineWaveCycles;

        // Decide whether to render a sine wave or a rectangle.  The threshold used here was empirically determined by
        // looking at the display, and can be changed if desired.
        if ( pixelsPerCycle > 7 ) {
          for ( let patternElementXPos = 0;
                patternElementXPos < patternElementLengthInPixels;
                patternElementXPos += this.pixelsPerWaveSegment ) {

            const sineWaveValue = centerY + this.maxPatternAmplitude * vibrationSpec.intensity *
                                  Math.sin( -Math.PI * 2 * numberOfSineWaveCycles * ( patternElementXPos / patternElementLengthInPixels ) );

            // Draw the next small segment of the sine wave that represents the vibration.
            context.lineTo( xPos, sineWaveValue );
            xPos += this.pixelsPerWaveSegment;
          }
        }
        else {

          // Add a rectangle that represents the vibration for this section of the pattern.
          context.rect(
            xPos,
            centerY - vibrationSpec.intensity * this.maxPatternAmplitude,
            patternElementLengthInPixels,
            vibrationSpec.intensity * this.maxPatternAmplitude * 2
          );
          context.fill();
          xPos += patternElementLengthInPixels;
          context.moveTo( xPos, centerY );
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
