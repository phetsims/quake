// Copyright 2022, University of Colorado Boulder

import VibrationPattern from './VibrationPattern.js';

/**
 * EnhancedVibration provides an API to haptic vibration capabilities that is, to some extent, cross-platform.  It also
 * provides other capabilities that support the vibration feature, such as playing a sound to accompany the vibration
 * patterns.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const soundURL = './sounds/haptic-buzz-loop-v2-006.wav';
const GAIN_CHANGE_TIME_CONSTANT = 0.005; // empirically determined to be pretty fast but not cause clicks
const NOOP = () => {};
const ALERT_ERROR = e => { alert( `Error: ${e}` ); };

class EnhancedVibration {

  constructor() {

    // @public {boolean} - flag used to control whether sounds should be played with the vibrations
    this.soundEnabled = false;

    // @private {AudioContext} - audio context used for sound operations
    this.audioContext = null;

    // @private {AudioBuffer} - sound that will be played to match vibrations, if enabled
    this.soundBuffer = null;

    // @private {number} - timer ID for the current in-progress sound timer if there is one, null if not
    this.soundTimerID = null;

    // @private {AudioBufferSourceNode} - sound that is currently being played if there is one, null if not
    this.audioBufferSourceNode = null;

    // @private {number} - index of the pattern element that is currently being played, -1 indicates none
    this.soundPatternIndex = -1;

    // Create the audio context, needed for sound generation.
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new window.AudioContext();
    }
    catch( e ) {
      alert( 'Web Audio API is not supported in this browser, no sounds will be generated.' );
    }

    // @private {GainNode} - gain node through which the sound is routed
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime( 0, this.audioContext.currentTime );
    this.gainNode.connect( this.audioContext.destination );

    // Load and decode the sound.
    const onDecodeSuccess = decodedAudio => {
      this.soundBuffer = decodedAudio;
      console.log( 'sound decoded successfully' );
    };
    const onDecodeError = decodeError => {
      alert( 'decode of audio data failed, sound will not be available, error: ' + decodeError );
      this.soundBuffer = this.audioContext.createBuffer( 1, 1, this.audioContext.sampleRate );
    };

    // Load and decode the sound.
    fetchLocal( soundURL )
      .then( response => response.arrayBuffer() )
      .then( arrayBuffer => this.audioContext.decodeAudioData( arrayBuffer, onDecodeSuccess, onDecodeError ) )
      .catch( reason => {
        console.error( 'sound load failed: ' + reason );
        this.soundBuffer = this.audioContext.createBuffer( 1, 1, this.audioContext.sampleRate );
      } );
  }

  /**
   * Play a sound based on the provided pattern.  This is used to play sounds that match vibration.
   * @param {VibrationPattern} pattern
   * @private
   */
  playVibrationSoundPattern( pattern ) {

    // Cancel any sound pattern that is already being played.
    this.cancelSound();

    // Turn up the gain so that sound will be heard as soon as it is started.  If a sound was just stopped, this could
    // cause the tail end of that sound to be heard, but this is a rare situation, and a tradeoff we're willing to live
    // with.
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues( now );
    this.gainNode.gain.setValueAtTime( 1, now );

    // Create the audio buffer source and start it playing.
    this.audioBufferSourceNode = this.audioContext.createBufferSource();
    this.audioBufferSourceNode.buffer = this.soundBuffer;
    this.audioBufferSourceNode.loop = true;
    this.audioBufferSourceNode.connect( this.gainNode );
    this.audioBufferSourceNode.start();

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
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues( now );

      // Set the gain based on the intensity of what is now the current step in the pattern.
      this.gainNode.gain.setTargetAtTime(
        pattern.elements[ this.soundPatternIndex ].intensity,
        now,
        GAIN_CHANGE_TIME_CONSTANT
      );

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
    if ( this.audioBufferSourceNode ) {
      this.gainNode.gain.setTargetAtTime( 0, this.audioContext.currentTime, GAIN_CHANGE_TIME_CONSTANT );

      // Stop the signal, but not right away or there will be an audible click.  The multiplier for the time was
      // empirically determined, adjust as needed.
      this.audioBufferSourceNode.stop( this.audioContext.currentTime + GAIN_CHANGE_TIME_CONSTANT * 10 );
    }
    this.soundPatternIndex = -1;
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

/**
 * Helper function for fetching resources.  This was needed for Haptics Playground because window.fetch doesn't work in
 * all of the needed situations.
 *
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
function fetchLocal( url ) {
  return new Promise( ( resolve, reject ) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve( new Response( xhr.response, { status: xhr.status } ) );
    };
    xhr.onerror = () => {
      reject( new TypeError( 'Local request failed' ) );
    };
    xhr.open( 'GET', url );
    xhr.responseType = 'arraybuffer';
    xhr.send( null );
  } );
}

export default EnhancedVibration;