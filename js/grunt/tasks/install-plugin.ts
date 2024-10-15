// Copyright 2024, University of Colorado Boulder

/**
 * Install or update the custom native vibration plugin.
 *
 * Note to future maintainers: This task removes a previous installation of the plugin and then adds it back in
 * order to make sure that the most recent version is installed. I (jbphet) tried using the `update` command,
 * which exists, but didn't seem to work, at least not as of early January 2022.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import child_process from 'child_process';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt';

// constants
const CUSTOM_VIBRATION_PLUGIN_NAME = 'cordova-plugin-native-vibration';

// function to indent the results of a command-line operation
const logIndentedMessage = ( commandResult: Buffer, indentation: number ) => {
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