Releasing the Haptics Playground App on the Google Play Store
=============================================================

You'll need an account on the Google Play Store with the appropriate permissions in order to do a release.  If you don't
have this, work with CU OIT to get set up.

You'll also need a code signing key to sign the app for uploading.  One can be set up using Android Studio, see
https://developer.android.com/studio/publish/app-signing#generate-key.

This doc is helpful for the Play Store part: https://codeburst.io/publish-a-cordova-generated-android-app-to-the-google-play-store-c7ae51cccdd5.

- [ ] Make sure the version number is correct and matches in the `package.json` file and the `config.xml` file that both
exist at the top level of the `quake` repo.
- [ ] Build and test the debug version via the usual `grunt` process on master, the do some sanity testing to verify
that this release is ready to publish.
- [ ] Run `cordova build android --release -- --keystore=<path to keystore> --storePassword=<keystore-password> --alias=upload --password=<key-password> --packageType=bundle`
to build the signed app bundle.
- [ ] Upload the app via Google Play Console.  The path to the app bundle will be something like `c\git-dev\quake\platforms\android\app\build\outputs\bundle\release\app-release.aab`.  The upload is done via Internal Testing -> Create New Release.
- [ ] Fill in the "Release name" with a message of the following format, but specific to this release: 
`v0.0.1 - initial prototype release for testing`
- [ ] Add release notes that describe what is new in this release.
- [ ] Immediately after the upload has completed and prior to making any changes to the repo, tag the current SHA in git
using the command `git tag -a <version> -m "<short-explanatory-message>"` where the <version> matches the string in the
`package.json` and `config.xml` files, and the message is a short description of the reasons for the release.  Example:
`git tag -a 0.0.1 -m "first release of Haptics Playground to be uploaded to the Play Store"`.
