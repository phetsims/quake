// Copyright 2022, University of Colorado Boulder

/**
 * Build the Haptics Playground app for all supported platforms
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import child_process from 'child_process';
import grunt from '../../../../perennial-alias/js/import-shared/grunt';

// Build the app for all supported platforms.
grunt.log.writeln( 'Building app for all supported platforms...' );
const commandResult = child_process.execSync( 'cordova build' );
grunt.log.writeln( `${commandResult}` );