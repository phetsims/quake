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

// function to indent the results of a command-line operation
  const logIndentedMessage = ( commandResult, indentation ) => {
    let indentationString = '';
    for ( let i = 0; i < indentation; i++ ) {
      indentationString += ' ';
    }

    // For platform independence, replace any CR-LF occurrences with a simple LF.
    const modifiedCommandResult = commandResult.toString().replace( '\r\n', '\n' );
    const lines = modifiedCommandResult.split( '\n' );
    lines.forEach( line => {
      grunt.log.writeln( `${indentationString}${line}` );
    } );
  };

  // Register the task that installs or updates the custom native vibration plugin.
  grunt.registerTask(
    'install-plugin',
    'Install or update the custom native vibration plugin',
    () => {

      // Note to future maintainers: This task removes a previous installation of the plugin and then adds it back in
      // order to make sure that the most recent version is installed. I (jbphet) tried using the `update` command,
      // which exists, but didn't seem to work, at least not as of early January 2022.

      grunt.log.writeln( `Checking whether ${CUSTOM_VIBRATION_PLUGIN_NAME} plugin is present...` );
      let commandResult = child_process.execSync( 'cordova plugin list' );
      if ( commandResult.includes( CUSTOM_VIBRATION_PLUGIN_NAME ) ) {
        grunt.log.writeln( '  Removing previous version of plugin...' );
        const removePluginCommand = `cordova plugin remove ${CUSTOM_VIBRATION_PLUGIN_NAME}`;
        grunt.log.writeln( `  command = ${removePluginCommand}` );
        commandResult = child_process.execSync( removePluginCommand );
        grunt.log.writeln( '  result:' );
        logIndentedMessage( commandResult, 4 );
      }
      grunt.log.writeln( '  Adding current version of plugin...' );
      const addPluginCommand = `cordova plugin add ./${CUSTOM_VIBRATION_PLUGIN_NAME}/`;
      grunt.log.writeln( `  command = ${addPluginCommand}` );
      commandResult = child_process.execSync( addPluginCommand );
      grunt.log.writeln( '  result:' );
      logIndentedMessage( commandResult, 4 );
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
  grunt.registerTask( 'default', [ 'lint', 'install-plugin', 'build' ] );
};