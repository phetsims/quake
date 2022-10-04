Setting Up Quake to Build the Haptics Playground Apps
=====================================================

The quake repo is the home for a multi-platform app that allows users to experiment with haptics on different devices.
The app uses Apache Cordova, which enables developers to write code in HTML, JavaScript, and CSS, and then build the
app to run on different platforms.  This document describes the steps necessary to set up the build environment.

The original goal of the development effort was to create an Android app.  Cordova was used so that PhET developers
could do the development in JavaScript.  This allowed the development and debugging to work on Android devices but also
to run in the browser.  The setup process below describes setup for these two target environments.  Running on iOS was
never tested, since iOS tablets do not general support vibrational haptics.

It is assumed that `node` and `npm` are already installed and available on the machine where this setup is being done.
If not, they should be installed before continuing.

In practice, the process of setting up the development environment and getting to where the app could be built and run
on an Android device and in a browser was fiddly and time-consuming.  Please be prepared for this.  The steps below
are an attempt to linearize all the gyrations that eventually led to a working setup, but that setup is, in our
experience, unlikely to be smooth.  There is a paragraph below the main setup steps entitled "If Problems Occur During
Setup" with some suggestions about what to try if things don't go well.

### Setup Steps

1. Make sure you have a Java 11.x JDK installed.  Cordova 11.0.0 requires this.
2. You'll need an environment variable `JAVA_HOME` that points to the root direction of the JDK.  The value will look
something like `C:\Program Files\Java\jdk-11.0.15.1` on a Windows system.
3. Install Android Studio.  The SDKs that come with it are needed to build the Android app, and the studio is used for
testing and debugging.
4. From within Android Studio, use Tools->SDK Manager to install SDK 12.0, API level 31.
5. Also from the SDK manager, install the latest build tools.  By the end of this effort, we were using version 33.
6. Add an environment variable (if it doesn't already exist) `ANDROID_SDK_ROOT` that points to your Android SDK root.
7. The value will be something like `C:\Users\bob\AppData\Local\Android\Sdk`
8. Install `gradle`, which is a build tool used by Android Studio, by following the instructions in the section
"Installing manually" of the installation guide at https://gradle.org/install/ (binary only).
9. Add the path to gradle to your system path, e.g. `C:\gradle-7.4.2\bin`
10. If cordova isn't already installed, install it globally using `npm install -g cordova`
11. Clone this repo (quake) if you haven't already.  This repo has no dependencies on other PhET repos, so it isn't\
necessary to clone or pull any others.
13. From the root of your local copy of this repo, run each of the following commands, making sure that each one is
successful.
  - Run `npm install` to get the needed node modules.
  - Run `cordova platform add android` to install the Android platform files.
  - Run `cordova platform add browser` to install the browser platform files.
  - Run `cordova plugin add cordova-plugin-vibration` to add the vibration plugin.
  - Run `cordova plugin add cordova-plugin-app-version` to add the plugin that enables to code to get the app version.
  - Run `cordova plugin add cordova-plugin-file` to add the plugin for file system interactions.
  - Run `grunt` to build the app.
12. If the build succeeded, the app should be able to run in a browser.  The runnable root will be in
<your-dev-root>/quake/platforms/browser/www/haptics-playground.html.
13. To run/debug on Android devices, open Android Studio, open the project at <your-dev-root>/quake/platforms/android,
install virtual devices and/or connect physical devices, and run the app using the icons in Android Studio.

### If Problems Occur During Setup

- There is an odd problem that came up every time this development environment was set up by either @jbphet or
@jessegreenberg.  The symptoms were that builds fail with a message like "Installed Build Tools revision 30.0.0 is
corrupted".  If you run into this, follow the steps from this Stack Overflow article and rename some of the tools: 
https://stackoverflow.com/questions/68387270/android-studio-error-installed-build-tools-revision-31-0-0-is-corrupted
- During one setup of the development environment on a Windows 11 PC, the installation of Android Studio didn't install
the desired SDKs, and I (jbphet) had to use the command line tools to uninstall the SDK and install the ones that were
needed for development.  The symptom was that running `grunt` produced the error message "No installed build tools
found...".  If you run into something like this, you may need to manually update the SDKs.  Please see
https://developer.android.com/studio/command-line/sdkmanager

### Debugging the App

The debugging process is a combination of testing using the "browser" platform, the Android emulator (run from Android
studio), and using a physical Android device (mine was connected via USB).
