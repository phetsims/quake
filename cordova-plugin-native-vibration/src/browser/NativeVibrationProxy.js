// Copyright 2022, University of Colorado Boulder

module.exports = {
  vibrate: ( success, error ) => {
    // Note: This doesn't actually do anything yet, and it may not be necessary that it ever does.  Perhaps it could
    //       call into the browser Vibration API, or maybe it should just produce sound.  But, as of this writing
    //       (March 2022), this just returns success so that the browser version of the app doesn't put up error alerts.
    window.setTimeout( () => { success(); }, 0 );
  },
  cancel: ( success, error ) => {
    // Note: This doesn't actually do anything yet, and it may not be necessary that it ever does.  Perhaps it could
    //       call into the browser Vibration API, or maybe it should just produce sound.  But, as of this writing
    //       (March 2022), this just returns success so that the browser version of the app doesn't put up error alerts.
    window.setTimeout( () => { success(); }, 0 );
  }
};

require( 'cordova/exec/proxy' ).add( 'NativeVibration', module.exports );
