// Copyright 2022, University of Colorado Boulder

/**
 * quake-specific grunt configuration, builds the Haptics Playground app
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// modules
const Gruntfile = require( '../../chipper/js/grunt/Gruntfile' );
const child_process = require( 'child_process' );

// constants
const CUSTOM_VIBRATION_PLUGIN_NAME = 'cordova-plugin-native-vibration';

module.exports = grunt => {
  Gruntfile( grunt );

  // Register the task that installs or updates the custom native vibration plugin.
  grunt.registerTask(
    'install-or-update-plugin',
    'Install or update the custom native vibration plugin',
    () => {
      grunt.log.writeln( `Checking whether ${CUSTOM_VIBRATION_PLUGIN_NAME} plugin is present...` );
      let commandResult = child_process.execSync( 'cordova plugin list' );
      if ( commandResult.includes( CUSTOM_VIBRATION_PLUGIN_NAME ) ) {
        grunt.log.writeln( '  Plugin was previously added, updating it...' );
        commandResult = child_process.execSync( 'cordova plugin update cordova-plugin-native-vibration' );
      }
      else {
        grunt.log.writeln( '  Plugin not installed, adding it...' );
        commandResult = child_process.execSync( `cordova plugin add ./${CUSTOM_VIBRATION_PLUGIN_NAME}/` );
      }
      grunt.log.writeln( `${commandResult}` );
      grunt.log.writeln( 'Plugin is installed and current.' );
    }
  );

  grunt.registerTask(
    'build',
    'Build the Haptics Playground app for all supported platforms',
    () => {

      // Build the app for all supported platforms.
      grunt.log.writeln( 'Building app for all supported platforms...' );
      const commandResult = child_process.execSync( 'cordova build' );
      grunt.log.writeln( `${commandResult}` );
    }
  );

  // register default task
  grunt.registerTask( 'default', [ 'lint', 'install-or-update-plugin', 'build' ] );
};