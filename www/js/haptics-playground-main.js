// Copyright 2022, University of Colorado Boulder

/**
 * Main entry point for the Cordova-based Haptics Playground application.  This sets up each of the screens and the nva
 * bar once the Cordova framework signals that the device is ready.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnhancedVibration from './EnhancedVibration.js';
import ParameterSlider from './ParameterSlider.js';
import ScreenDebugLogger from './ScreenDebugLogger.js';
import VibrationPatternDisplay from './VibrationPatternDisplay.js';

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
    25,
    1000,
    25,
    100,
    'Duration',
    'ms'
  );

  const spaceDurationSlider = new ParameterSlider(
    'space-duration-slider',
    25,
    1000,
    25,
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

    // Update the enabled/disabled state of the buttons.
    updatePatternButtonStates();
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

    // Update the enabled/disabled state of the buttons.
    updatePatternButtonStates();
  } );

  const clearPatternElementButton = document.getElementById( 'clear-pattern-button' );
  clearPatternElementButton.addEventListener( 'click', () => {
    pattern.length = 0;
    patternDisplay.clear();

    // Stop any vibration that is in progress.
    vibration.cancel();

    // Update the enabled/disabled state of the buttons.
    updatePatternButtonStates();
  } );

  // Set up the button and the handler for saving patterns.  This behaves a bit differently depending on the platform.
  const savePatternButton = document.getElementById( 'save-pattern-button' );
  savePatternButton.addEventListener( 'click', () => {

    const patternAsJson = JSON.stringify( pattern, null, 2 );
    const patternBlob = new window.Blob( [ patternAsJson ], { type: 'application/json' } );

    if ( cordova.platformId === 'browser' ) {

      // When saving a pattern on the browser, simply download the file.
      const a = document.createElement( 'a' );
      a.download = 'pattern.json';
      a.href = window.URL.createObjectURL( patternBlob );
      a.click();
    }
    else if ( cordova.platformId === 'android' ) {

      // When saving on Android, bring up the native "Save" dialog and allow the user to save the file.
      const fileName = 'pattern.json';
      cordova.plugins.saveDialog.saveFile( patternBlob, fileName )
        .then( () => {
          console.info( 'The file has been successfully saved' );
        } )
        .catch( reason => {
          console.warn( reason );
          alert( `File save failed, reason = ${reason}` );
        } );
    }
    else {
      alert( 'Saving of patterns is not supported on this platform.' );
    }
  } );

  // Set up the button and handler for loading patterns.  There is platform-specific code here.
  const loadPatternButton = document.getElementById( 'load-pattern-button' );
  loadPatternButton.addEventListener( 'click', () => {

    if ( cordova.platformId === 'browser' ) {

      // When running on the browser, set up an HTML input type that will allow file selection.
      let input = document.getElementById( 'file-input' );
      if ( !input ) {

        // The input element doesn't exist yet, so create it.
        input = document.createElement( 'input' );
        input.type = 'file';
        input.accept = 'application/json';
        document.body.appendChild( input );

        // Add a handler that will set the pattern to the file contents.
        input.addEventListener( 'change', () => {
          input.files[ 0 ].text().then( stuff => {
            pattern.length = 0;
            const loadedPattern = JSON.parse( stuff );
            loadedPattern.forEach( vibrationSpec => {
              pattern.push( vibrationSpec );
            } );
            patternDisplay.renderPattern( pattern );
            updatePatternButtonStates();
          } );
        } );
      }

      // Simulate a click in order to bring up the dialog.
      input.click();
    }
    else if ( cordova.platformId === 'android' ) {

      // When running on Android, put up the native file dialog to let the user choose a file, and then open it and load
      // it into the pattern.
      chooser.getFiles()
        .then( files => {
          const file = files[ 0 ];

          // The nested callbacks below took a lot of trial and error to figure out, but eventually it worked.  It's
          // ugly, and there may be a better way, but I (jbphet) wasn't able to find one in a reasonable time frame.
          // See https://github.com/phetsims/quake/issues/18.
          window.FilePath.resolveNativePath(
            file.uri,
            localFileUri => {
              window.resolveLocalFileSystemURL(
                localFileUri,
                fileEntry => {
                  fileEntry.file( file => {

                    // Read the contents of the file.
                    const reader = new window.FileReader();
                    reader.onloadend = () => {
                      pattern.length = 0;
                      if ( reader.result !== undefined && reader.result.length > 0 ) {
                        const loadedPattern = JSON.parse( reader.result );
                        loadedPattern.forEach( vibrationSpec => {
                          pattern.push( vibrationSpec );
                        } );
                        patternDisplay.renderPattern( pattern );
                        updatePatternButtonStates();
                      }
                      else {
                        alert( 'Unable to interpret file.' );
                      }
                    };
                    reader.onerror = e => {
                      alert( 'read file error' );
                    };
                    reader.readAsText( file );
                  }, error => { alert( `File read failed, error = ${error}` ); } );
                },
                error => { alert( `error: ${Object.keys( error )}` ); }
              );
            },
            e => alert( e.message )
          );
        } )
        .catch( error => { alert( `file chooser error = ${error}` ); } );
    }
    else {
      alert( 'Loading of patterns is not supported on this platform.' );
    }
  } );

  const repeatCheckbox = document.getElementById( 'repeat-checkbox' );
  repeatCheckbox.addEventListener( 'click', () => {

    // If there is a vibration already in progress when this is changed, cancel it.
    vibration.cancel();

    // Update button states.
    updatePatternButtonStates();
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

  const updatePatternButtonStates = () => {
    const playablePatternExists = pattern.reduce(
      ( playable, vibrationSpec ) => vibrationSpec.intensity > 0 || playable,
      false
    );
    playPatternButton.disabled = !playablePatternExists;
    stopPatternButton.disabled = !( playablePatternExists && repeatCheckbox.checked );
    clearPatternElementButton.disabled = pattern.length === 0;
    savePatternButton.disabled = !playablePatternExists;
  };

  // Do the initial button state update.
  updatePatternButtonStates();

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