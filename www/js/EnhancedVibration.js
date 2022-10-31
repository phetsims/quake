// Copyright 2022, University of Colorado Boulder

import VibrationPattern from './VibrationPattern.js';

/**
 * EnhancedVibration provides an API to haptic vibration capabilities that is, to some extent, cross-platform.  It also
 * provides other capabilities that support the vibration feature, such as playing a sound to accompany the vibration
 * patterns.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const SOUND_FILE_NAME = 'haptic-buzz-loop-v2-006.wav';
const NOOP = () => {};
const ALERT_ERROR = e => { alert( `Error: ${e}` ); };

// TODO - temporary code for testing native audio. ===================================================================

// TODO - do I need the following file-system-related code?
// function gotFS( fileSystem ) {
// save the file system for later access
// window.rootFS = fileSystem.root;
// }

// window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
// window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, gotFS, () => { alert( 'fail' );} );

// End of temporary code =============================================================================================

class EnhancedVibration {

  constructor() {

    // @public {boolean} - flag used to control whether sounds should be played with the vibrations
    this.soundEnabled = false;

    // @private {number} - timer ID for the current in-progress sound timer if there is one, null if not
    this.soundTimerID = null;

    // @private {number} - index of the pattern element that is currently being played, -1 indicates none
    this.soundPatternIndex = -1;

    // @private {boolean} - A flag that tracks whether the sound is currently playing.  The sound can be playing but
    // inaudible if we're in the middle of playing a pattern, and it isn't possible to query the media element for its
    // playing state, so this is where we track it.
    this.isSoundPlaying = false;

    // ============================== alternative approach =================
    // This is a kind of hokey way to find the vibration file on either the browser or Android.  The
    // "cordova-plugin-device" was breaking everything, so that couldn't be used, and the file system does not seem to
    // be very consistent across platforms.  This worked, ugly as it is, but if this app lives on, we may want to
    // improve this someday.
    let assetDirectoryPath;
    if ( cordova.file.applicationDirectory.includes( 'http' ) ) {

      // browser platform
      assetDirectoryPath = './';
    }
    else {

      // android platform
      assetDirectoryPath = cordova.file.applicationDirectory + 'www/';
    }

    // Create the media (sound) object.
    const soundFilePath = `${assetDirectoryPath}sounds/${SOUND_FILE_NAME}`;
    console.log( `soundFilePath = ${soundFilePath}` );
    this.vibrationSound = new Media(
      soundFilePath,
      NOOP,
      e => { alert( `media error, message = ${e.message}, code = ${e.code}` ); }
    );
  }

  /**
   * Play a sound based on the provided pattern.  This is used to play sounds that match vibration.
   * @param {VibrationPattern} pattern
   * @private
   */
  playVibrationSoundPattern( pattern ) {

    // Stop any sound pattern that is in progress, start the sound playing for this new pattern.
    if ( this.soundTimerID ) {
      clearTimeout( this.soundTimerID );
      this.soundTimerID = null;
    }
    if ( this.isSoundPlaying ) {
      this.vibrationSound.setVolume( 0 );
    }
    else {
      this.vibrationSound.play();
      this.isSoundPlaying = true;
    }

    // Set the internal index to the initial value needed for playing patterns.
    this.soundPatternIndex = -1;

    // Start the playing of the pattern.
    this.playNextPatternElement( pattern );
  }

  /**
   * Start the next step in the playing of the sound pattern.  This only alters the gain node and sets timeouts, it is
   * expected that the sound generation is started elsewhere.
   * @param {VibrationPattern} pattern
   * @private
   */
  playNextPatternElement( pattern ) {

    this.soundPatternIndex++;

    // If this is a repeating pattern, see if it's time to wrap the index.
    if ( pattern.repeat && this.soundPatternIndex >= pattern.length ) {
      this.soundPatternIndex = 0;
    }

    // Determine whether there is more pattern to be played.
    if ( this.soundPatternIndex < pattern.length ) {

      // Set the volume based on the intensity of what is now the current step in the pattern.
      this.vibrationSound.setVolume( pattern.elements[ this.soundPatternIndex ].intensity );

      // Set a timer to step to the next step in the pattern what it is time to do so.
      this.soundTimerID = setTimeout(
        () => { this.playNextPatternElement( pattern ); },
        pattern.elements[ this.soundPatternIndex ].duration * 1000
      );
    }
    else {

      // We're done playing the pattern, so stop.  This clause will never be executed for looping patterns.
      this.cancelSound();
    }
  }

  /**
   * Cancel any sound pattern that is currently being played.  This has no effect if no sound pattern is playing.
   * @public
   */
  cancelSound() {
    if ( this.soundTimerID ) {
      clearTimeout( this.soundTimerID );
      this.soundTimerID = null;
    }
    this.soundPatternIndex = -1;
    if ( this.isSoundPlaying ) {
      this.vibrationSound.stop();
      this.isSoundPlaying = false;
    }
  }

  /**
   * convenience method for one-shot vibrations
   * @param {number} duration - in seconds
   * @param {number} intensity - from 0 (min) to 1 (max)
   * @public
   */
  vibrateOnce( duration, intensity ) {
    const vibrationPattern = new VibrationPattern( this );
    vibrationPattern.addVibration( duration, intensity );
    this.vibrate( vibrationPattern );
  }

  /**
   * convenience method for double-click vibrations
   * @param {number} clickDuration - in seconds
   * @param {number} intensity - from 0 (min) to 1 (max)
   * @param {number} interClickTime - in seconds
   * @public
   */
  vibrateDoubleClick( clickDuration, intensity, interClickTime ) {
    const vibrationPattern = new VibrationPattern( this );
    vibrationPattern.addVibration( clickDuration, intensity );
    vibrationPattern.addSpace( interClickTime );
    vibrationPattern.addVibration( clickDuration, intensity );
    this.vibrate( vibrationPattern );
  }

  /**
   * Execute the vibration specified in the parameter.
   * @param {VibrationPattern} pattern
   * @public
   */
  vibrate( pattern ) {

    // If sound is enabled, play a sound that will match the vibration.
    if ( this.soundEnabled ) {
      this.playVibrationSoundPattern( pattern );
    }

    // Perform the haptic vibration.
    try {
      nativeVibration.vibrate( NOOP, ALERT_ERROR, pattern.elements, pattern.repeat );
    }
    catch( e ) {
      console.warn( 'error when trying to call vibrate: ' + e );
    }
  }

  /**
   * Create an instance of the VibrationSpec type using the provided parameters.
   * @param {number} duration - in seconds
   * @param {number} intensity - from 0 (min) to 1 (max)
   * @returns {VibrationSpec}
   * @public
   */
  createVibrationSpec( duration, intensity ) {
    return nativeVibration.createVibrationSpec( duration, intensity );
  }

  /**
   * Cancel any in-progress vibration and sound, do nothing if there is nothing in progress.
   * @public
   */
  cancel() {
    this.cancelSound();
    try {
      nativeVibration.cancel( NOOP, ALERT_ERROR );
    }
    catch( e ) {
      console.warn( 'error when trying to call cancel: ' + e );
    }
  }
}

export default EnhancedVibration;