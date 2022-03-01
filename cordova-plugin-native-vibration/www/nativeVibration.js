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
const utils = require( 'cordova/utils' );
const exec = require( 'cordova/exec' );
const cordova = require( 'cordova' );

// TODO: This was in the leveraged Device plugin.  Can it be removed?
channel.createSticky( 'onCordovaInfoReady' );

// Tell cordova channel to wait on the CordovaInfoReady event
channel.waitForInitialization( 'onCordovaInfoReady' );

class NativeVibration {

  constructor() {
    this.available = false;
    this.platform = null;
    this.version = null;
    this.uuid = null;
    this.cordova = null;
    this.model = null;
    this.manufacturer = null;
    this.isVirtual = null;
    this.serial = null;

    channel.onCordovaReady.subscribe( () => {
      this.getInfo(
        info => {
          // ignoring info.cordova returning from native, we should use value from cordova.version defined in cordova.js
          // TODO: CB-5105 native implementations should not return info.cordova
          const buildLabel = cordova.version;
          this.available = true;
          this.platform = info.platform;
          this.version = info.version;
          this.uuid = info.uuid;
          this.cordova = buildLabel;
          this.model = info.model;
          this.isVirtual = info.isVirtual;
          this.manufacturer = info.manufacturer || 'unknown';
          this.serial = info.serial || 'unknown';
          channel.onCordovaInfoReady.fire();
        },
        e => {
          this.available = false;
          utils.alert( '[ERROR] Error initializing Cordova: ' + e );
        } );
    } );
  }

  /**
   * Get device info.
   * TODO: This should be removed once vibration is fully functional.
   * @param {Function} successCallback The function to call when the heading data is available
   * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
   * @public
   */
  getInfo( successCallback, errorCallback ) {
    argscheck.checkArgs( 'FF', 'NativeVibration.getInfo', [ successCallback, errorCallback ] );
    exec( successCallback, errorCallback, 'NativeVibration', 'getDeviceInfo', [] );
  }

  /**
   * Trigger a haptic vibration based on a list of vibration specs.
   * @param {function} successCallback
   * @param {function} errorCallback
   * @param {VibrationSpec[]} vibrationSpecArray
   * @public
   */
  vibrate( successCallback, errorCallback, vibrationSpecArray ) {
    argscheck.checkArgs( 'FF', 'NativeVibration.vibrate', [ successCallback, errorCallback ] );
    exec( successCallback, errorCallback, 'NativeVibration', 'vibrate', [ vibrationSpecArray ] );
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
