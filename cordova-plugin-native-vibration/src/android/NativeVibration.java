// Copyright 2022, University of Colorado Boulder

package edu.colorado.phet.nativevibration;

import java.util.TimeZone;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.provider.Settings;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

public class NativeVibration extends CordovaPlugin {
    public static final String TAG = "NativeVibration";

    public static String platform;                            // Device OS
    public static String uuid;                                // Device UUID

    private static final String ANDROID_PLATFORM = "Android Baby!";
    private static final String AMAZON_PLATFORM = "amazon-fireos";
    private static final String AMAZON_DEVICE = "Amazon";

    // vibration
    private Vibrator vibrator;

    /**
     * Constructor.
     */
    public NativeVibration() {
    }

    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize( CordovaInterface cordova, CordovaWebView webView ) {
        super.initialize( cordova, webView );
        NativeVibration.uuid = getUuid();
        this.vibrator = (Vibrator) cordova.getActivity().getSystemService( Context.VIBRATOR_SERVICE );
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action          - the action to execute
     * @param args            - JSONArry of arguments for the plugin
     * @param callbackContext - the callback id used when calling back into JavaScript
     * @return true if the action was valid, false if not
     */
    public boolean execute( String action, JSONArray args, CallbackContext callbackContext ) throws JSONException {
        if ( "getDeviceInfo".equals( action ) ) {
            JSONObject r = new JSONObject();
            r.put( "uuid", NativeVibration.uuid );
            r.put( "version", this.getOSVersion() );
            r.put( "platform", this.getPlatform() );
            r.put( "model", this.getModel() );
            r.put( "manufacturer", this.getManufacturer() );
            r.put( "isVirtual", this.isVirtual() );
            r.put( "serial", this.getSerialNumber() );
            callbackContext.success( r );
        }
        else if ( "vibrate".equals( action ) ) {
            Log.i( "NativeVibration", "recieved vibrate action request" );
            Log.i( "NativeVibration", "pattern spec: " + args.getJSONArray( 0 ).toString() );
            boolean repeat = args.getBoolean( 1 );
            Log.i( "NativeVibration", "repeat: " + String.valueOf( repeat ) );
            int repeatIndex = repeat ? 0 : -1;
            JSONArray patternSpec = args.getJSONArray( 0 );
            long[] durations = new long[patternSpec.length()];
            int[] intensities = new int[patternSpec.length()];
            for ( int i = 0; i < patternSpec.length(); i++ ) {
                JSONObject vibrationSpec = patternSpec.getJSONObject( i );
                Log.i( "NativeVibration", vibrationSpec.get( "duration" ).toString() );
                durations[i] = Math.round( vibrationSpec.getDouble( "duration" ) * 1000 );
                Log.i( "NativeVibration", vibrationSpec.get( "intensity" ).toString() );
                int adjustedIntensity = (int) Math.round( vibrationSpec.getDouble( "intensity" ) * 255 );
                Log.i( "NativeVibration", String.valueOf( adjustedIntensity ) );
                intensities[i] = adjustedIntensity;
            }
            this.vibrator.vibrate( VibrationEffect.createWaveform( durations, intensities, repeatIndex ) );
            Log.i( "NativeVibration", "done" );
            JSONObject r = new JSONObject();
            callbackContext.success( r );
        }
        else if ( "cancel".equals( action ) ) {
            Log.i( "NativeVibration", "received cancel action request" );
            this.vibrator.cancel();
            Log.i( "NativeVibration", "done" );
            JSONObject r = new JSONObject();
            callbackContext.success( r );
        }
        else {
            return false;
        }
        return true;
    }

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------

    /**
     * Get the OS name.
     *
     * @return
     */
    public String getPlatform() {
        String platform;
        if ( isAmazonDevice() ) {
            platform = AMAZON_PLATFORM;
        }
        else {
            platform = ANDROID_PLATFORM;
        }
        return platform;
    }

    /**
     * Get the device's Universally Unique Identifier (UUID).
     *
     * @return
     */
    public String getUuid() {
        String uuid = Settings.Secure.getString( this.cordova.getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID );
        return uuid;
    }

    public String getModel() {
        String model = android.os.Build.MODEL;
        return model;
    }

    public String getProductName() {
        String productname = android.os.Build.PRODUCT;
        return productname;
    }

    public String getManufacturer() {
        String manufacturer = android.os.Build.MANUFACTURER;
        return manufacturer;
    }

    public String getSerialNumber() {
        String serial = android.os.Build.SERIAL;
        return serial;
    }

    /**
     * Get the OS version.
     *
     * @return
     */
    public String getOSVersion() {
        String osversion = android.os.Build.VERSION.RELEASE;
        return osversion;
    }

    public String getSDKVersion() {
        @SuppressWarnings("deprecation") String sdkversion = android.os.Build.VERSION.SDK;
        return sdkversion;
    }

    public String getTimeZoneID() {
        TimeZone tz = TimeZone.getDefault();
        return ( tz.getID() );
    }

    /**
     * Function to check if the device is manufactured by Amazon
     *
     * @return
     */
    public boolean isAmazonDevice() {
        if ( android.os.Build.MANUFACTURER.equals( AMAZON_DEVICE ) ) {
            return true;
        }
        return false;
    }

    public boolean isVirtual() {
        return android.os.Build.FINGERPRINT.contains( "generic" ) || android.os.Build.PRODUCT.contains( "sdk" );
    }

}
