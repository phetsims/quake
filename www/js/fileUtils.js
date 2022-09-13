// Copyright 2022, University of Colorado Boulder

/**
 * A set of file utility functions for local storage and retrieval of persistent information.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */


const noop = () => {};

const onErrorReadFile = e => {
  alert( `read file error: ${e}` );
};

const readFile = ( fileEntry, onReadSuccess ) => {

  fileEntry.file( file => {
    const reader = new window.FileReader();

    reader.onloadend = function() {
      if ( onReadSuccess ) {
        onReadSuccess( this.result );
      }
    };

    reader.readAsText( file );

  }, onErrorReadFile );
};

const writeFile = ( fileEntry, dataObj, onSuccess = noop ) => {

  // Create a FileWriter object for our FileEntry (log.txt).
  fileEntry.createWriter( fileWriter => {

    if ( onSuccess !== noop ) {
      fileWriter.onwriteend = onSuccess;
    }

    fileWriter.onerror = function( e ) {
      alert( 'Failed file write: ' + e.toString() );
    };

    // If data object is not passed in, create a new Blob instead.
    if ( !dataObj ) {
      dataObj = new window.Blob( [ 'some file data' ], { type: 'text/plain' } );
    }

    fileWriter.write( dataObj );
  } );
};

/**
 * Get a list of the file names in the provided directory.  This does NOT recursively descend the directory tree, it
 * only gets a list of the files at the top level.
 * @param {DirectoryEntry} directoryEntry
 * @param {function} successCallback
 */
const getFilesInDirectory = ( directoryEntry, successCallback ) => {

  // Get a reader for this directory.
  const directoryReader = directoryEntry.createReader();
  const fileNames = [];

  directoryReader.readEntries(
    results => {
      results.forEach( fileEntry => {
        if ( fileEntry.isFile ) {
          fileNames.push( fileEntry.name );
        }
      } );
      successCallback( fileNames );
    },
    error => {
      alert( `directory reading error = ${error}` );
    }
  );
};

/**
 * Read the list of files from the specified directory path for this app's local file storage.  This does not return
 * directories and does not recursively descend the file tree.
 * @param {string} path
 * @param {function} callback
 */
const getLocalFiles = ( path, callback ) => {
  window.requestFileSystem( window.LocalFileSystem.PERSISTENT, 0, fs => {
    fs.root.getDirectory( path, {}, directoryEntry => {
      getFilesInDirectory( directoryEntry, callback );
    } );
  } );
};

export { readFile, writeFile, getLocalFiles };