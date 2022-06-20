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

function onErrorReadFile( e ) {
  console.log( `read file error: ${e}` );
}

function onErrorCreateFile( e ) {
  console.log( `create file error: ${e}` );
}

function onErrorLoadFs( e ) {
  console.log( `create file error: ${e}` );
}

function readFile( fileEntry, onReadSuccess ) {

  fileEntry.file( file => {
    const reader = new window.FileReader();

    reader.onloadend = function() {
      console.log( 'Successful file read: ' + this.result );
      if ( onReadSuccess ) {
        onReadSuccess( this.result );
      }
    };

    reader.readAsText( file );

  }, onErrorReadFile );
}

function writeFile( fileEntry, dataObj ) {

  // Create a FileWriter object for our FileEntry (log.txt).
  fileEntry.createWriter( fileWriter => {

    fileWriter.onwriteend = function() {
      console.log( 'Successful file write...' );
      readFile( fileEntry );
    };

    fileWriter.onerror = function( e ) {
      console.log( 'Failed file write: ' + e.toString() );
    };

    // If data object is not passed in, create a new Blob instead.
    if ( !dataObj ) {
      dataObj = new window.Blob( [ 'some file data' ], { type: 'text/plain' } );
    }

    fileWriter.write( dataObj );
  } );
}

/**
 * Get a list of the file names in the provided directory.  This does NOT recursively descend the directory tree, it
 * only gets a list of the files at the top level.
 * @param {DirectoryEntry} directoryEntry
 * @param {function} successCallback
 */
function getFilesInDirectory( directoryEntry, successCallback ) {

  // Get a reader for this directory.
  const directoryReader = directoryEntry.createReader();
  const fileNames = [];

  directoryReader.readEntries(
    results => {
      results.forEach( fileEntry => {
        console.log( `fileEntry.name = ${fileEntry.name}` );
        if ( fileEntry.isFile ) {
          fileNames.push( fileEntry.name );
        }
      } );
      successCallback( fileNames );
    },
    error => {
      console.log( `directory reading error = ${error}` );
    }
  );
}

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
    const inputValueAsNumber = Number( numberOfClicksInput.value );
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

  // TODO - temporary - remove some of the pattern files.  Keep this around until I've got file save/load working, then
  //  consider making it into a convenience function for future development.
  window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {
    fs.root.getDirectory( '/', {}, directoryEntry => {

      // Get a reader for this directory.
      const directoryReader = directoryEntry.createReader();

      directoryReader.readEntries(
        results => {
          results.forEach( fileEntry => {
            if ( fileEntry.isFile && fileEntry.name === '.json' ) {
              fileEntry.remove( file => { alert( 'file removed: ' + file.name ); } );
            }
          } );
        },
        error => {
          console.log( `directory reading error = ${error}` );
        }
      );
    } );
  } );

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

  const repeatCheckbox = document.getElementById( 'repeat-checkbox' );
  repeatCheckbox.addEventListener( 'click', () => {

    // If there is a vibration already in progress when this is changed, cancel it.
    vibration.cancel();

    // Update button states.
    updatePatternButtonStates();
  } );

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

  // Get a reference to the input box for the file name where a pattern can be saved.
  const saveFileNameTextInputElement = document.getElementById( 'save-file-name' );

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

      // Get the file name from the document.
      let saveFileName = saveFileNameTextInputElement.value;
      let validFileName = true;

      if ( saveFileName.length > 0 && !saveFileName.includes( '.' ) ) {

        // Add the .json file type to the name.
        saveFileName += '.json';
        saveFileNameTextInputElement.value = saveFileName;
      }
      else if ( !saveFileName.includes( '.json' ) ) {
        validFileName = false;
      }

      if ( validFileName ) {

        // Save the file to the local file system.
        window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {

          fs.root.getFile( saveFileName, { create: true, exclusive: false }, fileEntry => {

            writeFile( fileEntry, patternBlob );

            // After writing the file, update the selector that contains the list of loadable files.
            updateLoadablePatternFileList();

          }, onErrorCreateFile );

        }, onErrorLoadFs );
      }
      else {
        alert( 'Invalid file name.  Please specify a name that ends with ".json", for example, "pattern9.json"' );
      }
    }
    else {
      alert( 'Saving of patterns is not supported on this platform.' );
    }
  } );

  // Set the initial value of the save file name to the first unused file name of the form "pattern-x.json", where "x"
  // is a positive integer.
  window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {
    fs.root.getDirectory( '/', {}, directoryEntry => {
      getFilesInDirectory( directoryEntry, fileList => {

        // Come up with a default file name that is not yet used, but bail if the number gets ridiculous.
        const fileNameStem = 'pattern-';
        const fileNameEnding = '.json';
        let initialFileName = 'temp' + fileNameEnding;
        let found = false;
        for ( let i = 1; i < 1000 && !found; i++ ) {
          const testFileName = `${fileNameStem}${i}${fileNameEnding}`;
          if ( !fileList.includes( testFileName ) ) {
            initialFileName = testFileName;
            found = true;
          }
        }

        saveFileNameTextInputElement.value = initialFileName;
      } );
    } );
  } );

  const loadablePatternFileSelector = document.getElementById( 'loadable-files-selector' );

  // Closure to update the list of loadable patterns.
  const updateLoadablePatternFileList = () => {

    // Remove everything that is currently an option in the select element.
    for ( let i = 0; i < loadablePatternFileSelector.options.length; i++ ) {
      loadablePatternFileSelector.remove( i );
    }

    // Add a list of all files in the top level of the app's local storage area to the select element.
    window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {
      fs.root.getDirectory( '/', {}, directoryEntry => {
        getFilesInDirectory( directoryEntry, fileList => {
          fileList.forEach( ( fileName, index ) => {
            const option = document.createElement( 'option' );
            option.text = fileName;
            loadablePatternFileSelector.add( option, loadablePatternFileSelector[ index ] );
          } );
        } );
      } );
    } );
  };

  // Do the initial setup of the load file selector.
  updateLoadablePatternFileList();

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

      // Load the file specified in the file selector.
      window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {

        const fileNameToOpen = loadablePatternFileSelector.options[ loadablePatternFileSelector.selectedIndex ].text;
        fs.root.getFile( fileNameToOpen, { create: false, exclusive: false }, fileEntry => {

          console.log( 'fileEntry is file? ' + fileEntry.isFile.toString() );
          console.log( 'fileEntry name: ' + fileEntry.name );
          console.log( 'fileEntry fullPath: ' + fileEntry.fullPath );
          readFile( fileEntry, fileData => {
            pattern.length = 0;
            const loadedPattern = JSON.parse( fileData );
            loadedPattern.forEach( vibrationSpec => {
              pattern.push( vibrationSpec );
            } );
            patternDisplay.renderPattern( pattern );
            updatePatternButtonStates();
          } );
        }, onErrorCreateFile );

      }, onErrorLoadFs );
    }
    else {
      alert( 'Loading of patterns is not supported on this platform.' );
    }
  } );

  const playPatternButton = document.getElementById( 'play-pattern-button' );
  playPatternButton.addEventListener( 'click', () => {
    if ( pattern.length > 0 ) {
      vibration.vibrate( pattern, repeatCheckbox.checked );
    }
  } );

  const stopPatternButton = document.getElementById( 'stop-pattern-button' );
  stopPatternButton.addEventListener( 'click', () => {
    vibration.cancel();
  } );

  const exportPatternButton = document.getElementById( 'export-pattern-button' );
  const exportTextArea = document.getElementById( 'export-text-area' );
  exportTextArea.hidden = true;
  exportPatternButton.addEventListener( 'click', () => {
    if ( exportTextArea.hidden ) {
      updateExportTextArea();
      exportTextArea.hidden = false;
      exportPatternButton.innerText = 'Hide Export';
    }
    else {
      exportTextArea.hidden = true;
      exportPatternButton.innerText = 'Export';
    }
  } );

  const updateExportTextArea = () => {
    const patternAsJson = JSON.stringify( pattern );
    exportTextArea.innerText = patternAsJson;
  };

  // A closure that updates the state - enabled or disabled - of the various pattern manipulation buttons.
  const updatePatternButtonStates = () => {
    const playablePatternExists = pattern.reduce(
      ( playable, vibrationSpec ) => vibrationSpec.intensity > 0 || playable,
      false
    );
    playPatternButton.disabled = !playablePatternExists;
    stopPatternButton.disabled = !( playablePatternExists && repeatCheckbox.checked );
    clearPatternElementButton.disabled = pattern.length === 0;
    exportPatternButton.disabled = !playablePatternExists;
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