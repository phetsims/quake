// Copyright 2022, University of Colorado Boulder

/**
 * EnhancedVibration provides an API to haptic vibration capabilities that is, to some extent, cross-platform.  It also
 * provides other capabilities that support the vibration feature, such as playing a sound to accompany the vibration
 * patterns.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const soundURL = './sounds/haptic-buzz-loop-v2-006.wav';
const GAIN_CHANGE_TIME_CONSTANT = 0.005;
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

    // @private {number} - index into the sound pattern that is currently being played
    this.soundPatternIndex = 0;

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
   * @param {VibrationSpec[]} pattern
   * @param {boolean} repeat
   * @private
   */
  playVibrationSoundPattern( pattern, repeat = false ) {

    // Cancel any sound pattern that is already being played.
    this.cancelSound();

    // Create the audio buffer source and start it playing.
    this.audioBufferSourceNode = this.audioContext.createBufferSource();
    this.audioBufferSourceNode.buffer = this.soundBuffer;
    this.audioBufferSourceNode.loop = true;
    this.audioBufferSourceNode.connect( this.gainNode );
    this.audioBufferSourceNode.start();

    // Start the playing of the pattern.
    this.nextSoundPattern( pattern, repeat );
  }

  /**
   * Start the next step in the playing of the sound pattern.  This only alters the gain node and sets timeouts, it is
   * expected that the sound generation is started elsewhere.
   * @param {VibrationSpec[]} pattern
   * @param {boolean} repeat
   * @private
   */
  nextSoundPattern( pattern, repeat ) {

    // If this is a repeating pattern, see if it's time to wrap the index.
    if ( repeat && this.soundPatternIndex >= pattern.length ) {
      this.soundPatternIndex = 0;
    }

    // Determine whether there is more pattern to be played.
    if ( this.soundPatternIndex < pattern.length ) {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues( now );
      this.gainNode.gain.setTargetAtTime(
        pattern[ this.soundPatternIndex ].intensity,
        this.audioContext.currentTime,
        GAIN_CHANGE_TIME_CONSTANT
      );
      this.soundTimerID = setTimeout( () => {
        this.soundPatternIndex++;
        this.nextSoundPattern( pattern, repeat );
      }, pattern[ this.soundPatternIndex ].duration * 1000 );
    }
    else {

      // We're done playing the pattern, so stop.
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
    this.soundPatternIndex = 0;
  }

  /**
   * convenience method for one-shot vibrations
   * @param {number} duration - in seconds
   * @param {number} intensity - from 0 (min) to 1 (max)
   * @public
   */
  vibrateOnce( duration, intensity ) {
    const vibrationSpecList = [ nativeVibration.createVibrationSpec( duration, intensity ) ];
    this.vibrate( vibrationSpecList );
  }

  /**
   * convenience method for double-click vibrations
   * @param {number} clickDuration - in seconds
   * @param {number} intensity - from 0 (min) to 1 (max)
   * @param {number} interClickTime - in seconds
   * @public
   */
  vibrateDoubleClick( clickDuration, intensity, interClickTime ) {
    const vibrationSpecList = [
      nativeVibration.createVibrationSpec( clickDuration, intensity ),
      nativeVibration.createVibrationSpec( interClickTime, 0 ),
      nativeVibration.createVibrationSpec( clickDuration, intensity )
    ];
    this.vibrate( vibrationSpecList );
  }

  /**
   * Execute the vibration specified in the parameter.
   * @param {VibrationSpec[]} vibrationSpecList
   * @param {boolean} repeat
   * @public
   */
  vibrate( vibrationSpecList, repeat = false ) {
    if ( this.soundEnabled ) {
      this.playVibrationSoundPattern( vibrationSpecList, repeat );
    }
    try {
      nativeVibration.vibrate( NOOP, ALERT_ERROR, vibrationSpecList, repeat );
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