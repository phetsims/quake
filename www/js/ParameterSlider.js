// Copyright 2022, University of Colorado Boulder

/**
 * ParameterSlider defines the behavior for a slider that controls a numeric parameter.  There must be a corresponding
 * element in the HTML document.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import assert from './assert.js';

class ParameterSlider {

  constructor( id, minValue, maxValue, step, initialValue, textualLabel, units = '' ) {

    // parameter checking
    assert( initialValue >= minValue && initialValue <= maxValue, 'unusable initial value' );
    const inputSlider = document.getElementById( id );
    assert( inputSlider, `no slider found for id ${id}` );

    // Set up the slider.
    inputSlider.min = minValue;
    inputSlider.max = maxValue;
    inputSlider.step = step;
    inputSlider.value = initialValue;

    // Update the label on the slider when values change.
    const label = document.getElementById( `${id}-label` );
    const updateSliderLabel = () => {
      label.innerHTML = `${textualLabel}: ${inputSlider.value} ${units}`;
    };
    updateSliderLabel();
    inputSlider.oninput = updateSliderLabel;

    // Make the input slider available to the methods.
    this.inputSlider = inputSlider;
  }

  get value() {
    return this.inputSlider.value;
  }
}

export default ParameterSlider;