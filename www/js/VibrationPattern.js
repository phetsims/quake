// Copyright 2022, University of Colorado Boulder

/**
 * VibrationPattern defines a series of on/off vibrations, with intensity values, that can be used to define a
 * haptics vibration pattern.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import assert from './assert.js';

class VibrationPattern {

  /**
   * @param {EnhancedVibration} vibration
   * @param {boolean} repeat
   */
  constructor( vibration, repeat = false ) {

    // @private {EnhancedVibration}
    this.vibration = vibration;

    // @public (read-only) {VibrationSpec}
    this.elements = [];

    // @public {boolean}
    this.repeat = repeat;
  }

  // @public
  get length() {
    return this.elements.length;
  }

  /**
   * Add a vibration of the specified intensity.  This will consolidate with the last pattern element if the intensity
   * is the same.
   * @param {number} duration - in seconds
   * @param {number} intensity - from 0 to 1
   * @public
   */
  addVibration( duration, intensity ) {
    assert && assert( duration > 0, 'duration must be greater than zero' );
    assert && assert( intensity >= 0 && intensity <= 1, 'intensity out of range' );
    if ( this.elements.length > 0 && this.elements[ this.length - 1 ].intensity === intensity ) {

      // This new vibration is at the same intensity as the previous one, so just extend the previous one instead of
      // adding another element.
      this.elements[ this.length - 1 ].duration += duration;
    }
    else {

      // Create a new vibration spec and add it to the end of the pattern array.
      const vibrationSpec = this.vibration.createVibrationSpec( duration, intensity );
      this.elements.push( vibrationSpec );
    }
  }

  /**
   * convenience method for adding space to the pattern
   * @param {number} duration (in seconds)
   * @public
   */
  addSpace( duration ) {
    this.addVibration( duration, 0 );
  }

  /**
   * Clear all elements from this pattern.
   * @public
   */
  clear() {
    this.elements.length = 0;
    this.repeat = false;
  }

  /**
   * Get a JSON representation of the pattern, suitable for saving or exporting.
   * @returns {string}
   * @public
   */
  getPatternAsJSON() {

    const serializableObject = {

      // Version number of the format.  Increment this if the format changes.
      formatVersion: 1,

      // boolean value indicating whether this should repeat
      repeat: this.repeat,

      // array of vibration specs that comprise the pattern
      elements: this.elements
    };

    return JSON.stringify( serializableObject, ( key, val ) => {

      // Do some rounding to avoid many-digit floating point values.
      if ( typeof val === 'number' ) {
        val = Number.parseFloat( val.toFixed( 3 ) );
      }
      return val;
    } );
  }

  /**
   * Load the pattern from a JSON spec
   * @param {string} jsonPattern
   * @public
   */
  loadJSON( jsonPattern ) {
    const deserializedObject = JSON.parse( jsonPattern );
    if ( deserializedObject.formatVersion === 1 ) {
      this.clear();
      this.repeat = deserializedObject.repeat;
      deserializedObject.elements.forEach( vibrationSpec => {
        this.elements.push( vibrationSpec );
      } );
    }
    else {
      alert( `Unsupported format for pattern file, value = ${deserializedObject.formatVersion}` );
    }
  }

  /**
   * Get the total duration of this pattern.
   * @returns duration in seconds
   * @public
   */
  getTotalDuration() {
    return this.elements.reduce(
      ( totalDurationSoFar, vibrationSpec ) => totalDurationSoFar + vibrationSpec.duration,
      0
    );
  }
}

export default VibrationPattern;