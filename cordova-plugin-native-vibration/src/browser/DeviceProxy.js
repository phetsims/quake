// Copyright 2022, University of Colorado Boulder

const platform = require( 'cordova/platform' );

function getPlatform() {
  return 'browser baby!';
}

function getModel() {
  return getBrowserInfo( true );
}

function getVersion() {
  return getBrowserInfo( false );
}

function getBrowserInfo( getModel ) {
  const userAgent = navigator.userAgent;
  let returnVal = '';
  let offset;

  if ( ( offset = userAgent.indexOf( 'Edge' ) ) !== -1 ) {
    returnVal = ( getModel ) ? 'Edge' : userAgent.substring( offset + 5 );
  }
  else if ( ( offset = userAgent.indexOf( 'Chrome' ) ) !== -1 ) {
    returnVal = ( getModel ) ? 'Chrome' : userAgent.substring( offset + 7 );
  }
  else if ( ( offset = userAgent.indexOf( 'Safari' ) ) !== -1 ) {
    if ( getModel ) {
      returnVal = 'Safari';
    }
    else {
      returnVal = userAgent.substring( offset + 7 );

      if ( ( offset = userAgent.indexOf( 'Version' ) ) !== -1 ) {
        returnVal = userAgent.substring( offset + 8 );
      }
    }
  }
  else if ( ( offset = userAgent.indexOf( 'Firefox' ) ) !== -1 ) {
    returnVal = ( getModel ) ? 'Firefox' : userAgent.substring( offset + 8 );
  }
  else if ( ( offset = userAgent.indexOf( 'MSIE' ) ) !== -1 ) {
    returnVal = ( getModel ) ? 'MSIE' : userAgent.substring( offset + 5 );
  }
  else if ( ( offset = userAgent.indexOf( 'Trident' ) ) !== -1 ) {
    returnVal = ( getModel ) ? 'MSIE' : '11';
  }

  if ( ( offset = returnVal.indexOf( ';' ) ) !== -1 || ( offset = returnVal.indexOf( ' ' ) ) !== -1 ) {
    returnVal = returnVal.substring( 0, offset );
  }

  return returnVal;
}

module.exports = {
  getDeviceInfo: function( success, error ) {
    global.setTimeout( () => {
      success( {
        cordova: platform.cordovaVersion,
        platform: getPlatform(),
        model: getModel(),
        version: getVersion(),
        uuid: null,
        isVirtual: false
      } );
    }, 0 );
  }
};

require( 'cordova/exec/proxy' ).add( 'Device', module.exports );
