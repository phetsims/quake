// Copyright 2022, University of Colorado Boulder

/**
 * This file contains part of the code necessary for an Apache Cordova plugin that allows an app to access native
 * haptic vibration capabilities for the platform on which the app is running.  The NativeVibration class is defined,
 * and a singleton instance of this class is exported.
 *
 * As of Feb 2022, this supports the Android and Browser platforms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const argscheck = require( 'cordova/argscheck' );
const channel = require( 'cordova/channel' );
const exec = require( 'cordova/exec' );
const cordova = require( 'cordova' );

// TODO: This was in the leveraged Device plugin.  Can it be removed?
channel.createSticky( 'onCordovaInfoReady' );

// Tell cordova channel to wait on the CordovaInfoReady event
channel.waitForInitialization( 'onCordovaInfoReady' );

class NativeVibration {

  constructor() {
    this.available = false;

    channel.onCordovaReady.subscribe( () => {
      const buildLabel = cordova.version;
      this.cordova = buildLabel;
      this.available = true;
      channel.onCordovaInfoReady.fire();
      console.log( 'NativeVibration instance received onCordovaReady' );
    } );
  }

  /**
   * Trigger a haptic vibration based on a list of vibration specs.
   * @param {function} successCallback
   * @param {function} errorCallback
   * @param {VibrationSpec[]} vibrationPattern
   * @param {boolean} repeat - whether to repeat the pattern until stopped
   * @public
   */
  vibrate( successCallback, errorCallback, vibrationPattern, repeat = false ) {
    argscheck.checkArgs( 'FFA', 'NativeVibration.vibrate', [ successCallback, errorCallback, vibrationPattern ] );
    exec( successCallback, errorCallback, 'NativeVibration', 'vibrate', [ vibrationPattern, repeat ] );
  }

  /**
   * Cancel the currently active vibration.  Does nothing if no vibration is in progress.
   * @param {function} successCallback
   * @param {function} errorCallback
   * @public
   */
  cancel( successCallback, errorCallback ) {
    argscheck.checkArgs( 'FF', 'NativeVibration.cancel', [ successCallback, errorCallback ] );
    exec( successCallback, errorCallback, 'NativeVibration', 'cancel' );
  }

  /**
   * Create a vibration spec from the specified values.  This exists to make it easy to create vibration specs using
   * the nativeVibration instance, since it is generally used as a global.
   * @param {number} duration - duration in seconds
   * @param {number} intensity - intensity from 0 to 1
   * @returns {VibrationSpec}
   * @public
   */
  createVibrationSpec( duration, intensity ) {
    return new VibrationSpec( duration, intensity );
  }

  /**
   * convenience method for a one-shot vibration
   * @param {function} successCallback
   * @param {function} errorCallback
   * @param {number} duration - duration in seconds
   * @param {number} intensity - intensity from 0 to 1
   * @public
   */
  vibrateOnce( successCallback, errorCallback, duration, intensity ) {
    this.vibrate( successCallback, errorCallback, [ this.createVibrationSpec( duration, intensity ) ] );
  }

  /**
   * convenience method for a double click vibration pattern
   * @param {function} successCallback
   * @param {function} errorCallback
   * @param {number} duration - duration in seconds
   * @param {number} intensity - intensity from 0 to 1
   * @param {number} interClickTime - time between clicks, in seconds
   * @public
   */
  vibrateDoubleClick( successCallback, errorCallback, duration, intensity, interClickTime ) {
    this.vibrate(
      successCallback,
      errorCallback,
      [
        this.createVibrationSpec( duration, intensity ),
        this.createVibrationSpec( interClickTime, 0 ),
        this.createVibrationSpec( duration, intensity )
      ]
    );
  }
}

/**
 * VibrationSpec is a simple, data-only class that includes the information necessary for a single vibration event of
 * a specific duration and intensity.
 */
class VibrationSpec {

  /**
   * @param {number} duration - duration of the vibration in seconds
   * @param {number} intensity - intensity of the vibration from 0 (min) to 1 (max)
   */
  constructor( duration, intensity ) {

    // parameter checking
    if ( duration < 0 ) {
      throw new Error( 'invalid duration' );
    }

    if ( intensity < 0 || intensity > 1 ) {
      throw new Error( 'invalid intensity' );
    }

    // @public (read-only) {number} - duration of the vibration in seconds
    this.duration = duration;

    // @public (read-only) {number} - intensity of the vibration from 0 (min) to 1 (max)
    this.intensity = intensity;
  }
}

module.exports = new NativeVibration();
