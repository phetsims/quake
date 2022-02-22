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

    const self = this;

    channel.onCordovaReady.subscribe( () => {
      self.getInfo(
        info => {
          // ignoring info.cordova returning from native, we should use value from cordova.version defined in cordova.js
          // TODO: CB-5105 native implementations should not return info.cordova
          const buildLabel = cordova.version;
          self.available = true;
          self.platform = info.platform;
          self.version = info.version;
          self.uuid = info.uuid;
          self.cordova = buildLabel;
          self.model = info.model;
          self.isVirtual = info.isVirtual;
          self.manufacturer = info.manufacturer || 'unknown';
          self.serial = info.serial || 'unknown';
          channel.onCordovaInfoReady.fire();
        },
        e => {
          self.available = false;
          utils.alert( '[ERROR] Error initializing Cordova: ' + e );
        } );
    } );
  }

  /**
   * Get device info
   * @param {Function} successCallback The function to call when the heading data is available
   * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
   * @public
   */
  getInfo( successCallback, errorCallback ) {
    argscheck.checkArgs( 'fF', 'NativeVibration.getInfo', [ successCallback, errorCallback ] );
    exec( successCallback, errorCallback, 'NativeVibration', 'getDeviceInfo', [] );
  }
}

module.exports = new NativeVibration();
