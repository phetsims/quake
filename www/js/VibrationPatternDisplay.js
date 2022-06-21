// Copyright 2022, University of Colorado Boulder

/**
 * VibrationPatternDisplay visually portrays a vibration pattern that consists of a set of vibration specs. It is
 * essentially a plot with time on the X axis and vibration intensity on the Y axis.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import assert from './assert.js';

class VibrationPatternDisplay {

  /**
   * @param {string} canvasID - ID of the HTML canvas element that will be used to display the pattern.
   * @param {string} labelID - ID of the label for the display.
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
   * @param {VibrationPattern} pattern
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
    const totalPatternDuration = pattern.getTotalDuration();

    // Calculate the amount of time represented per pixel for rendering this pattern.
    const secondsPerPixel = totalPatternDuration / this.canvas.width;

    // running x position value
    let xPos = 0;

    // other useful value for rendering
    const centerY = this.canvas.height / 2;

    // Set the starting position for the rendering of the pattern.
    context.lineTo( xPos, centerY );

    // Render the various segments of the pattern.
    pattern.elements.forEach( vibrationSpec => {

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

export default VibrationPatternDisplay;