// Copyright 2020-2024, University of Colorado Boulder

const Gruntfile = require( '../chipper/Gruntfile' );
const registerTasks = require( '../perennial/js/grunt/util/registerTasks' );

/**
 * quake-specific grunt configuration, builds the Haptics Playground app
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
module.exports = grunt => {
  Gruntfile( grunt );

  // Last to override "default" task
  registerTasks( grunt, `${__dirname}/js/grunt/tasks/` );
};