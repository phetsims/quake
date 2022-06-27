Setting Up Quake to Build the Haptics Playground Apps
=====================================================

The quake repo is the home for a multi-platform app that allows users to experiment with haptics on different devices.
The app uses Apache Cordova, which enables developers to write code in HTML, JavaScript, and CSS, and then build the
app to run on different platforms.  This document describes the steps necessary to set up the build environment.

It is assumed that `node` and `npm` are already set up and available.

1. Make sure you have a Java 1.8.x JDK installed.  Cordova requires this.  The latest JDKs don't work.  Don't know why.
2. You'll need an environment variable `JAVA_HOME` that points to the root direction of the JDK.  The value will look something like `C:\Program Files\Java\jdk1.8.0_301` on a Windows system.
3. Install Android Studio.  The SDKs are needed to build the Android app, and the studio is used for testing and debugging.
4. From within Android Studio, use Tools->SDK Manager to install SDK 8.0 (Oreo), API version 26.
5. Add an environment variable (if it doesn't already exist) `ANDROID_SDK_ROOT` that points to your Android SDK root.  The value will be something like `C:\Users\bob\AppData\Local\Android\Sdk`
6. Install `gradle`, which is a build tool used by Android Studio, by following the instructions in the section "Installing manually" of the installation guide at https://gradle.org/install/ (binary only).
7. Add the path to gradle to your system path, e.g. `C:\gradle-7.4.2\bin`
8. If cordova isn't already installed, install it globally using `npm install -g cordova`
9. Clone this repo (quake).  This repo has no dependencies on other PhET repos, so it isn't necessary to clone or pull any others.
10. From the root of your local copy of this repo, run each of the following commands, making sure that each one is successful.
  - Run `npm install` to get the needed node modules.
  - Run `cordova platform add android` to install the Android platform files.
  - Run `cordova platform add browser` to install the browser platform files.
  - Run `cordova plugin add cordova-plugin-vibration` to add the vibration plugin.
  - Run `cordova plugin add cordova-plugin-app-version` to add the plugin that enables to code to get the app version.
  - Run `cordova plugin add cordova-plugin-file` to add the plugin for file system interactions.
  - Run `grunt` to build the app.
17. There is an odd problem that I (jbphet) and other developers ran into where builds fail due to the name of some of the build tools.  If you run into this, follow the steps from this Stack Overflow article and rename some of the tools: https://stackoverflow.com/questions/68387270/android-studio-error-installed-build-tools-revision-31-0-0-is-corrupted
18. From Android Studio, open the project at <your-dev-root>/quake/platforms/android

TODO: Notes about things that should be added:
- The debugging process is a combination of testing using the "browser" platform, the Android emulator (run from Android
studio), and using a physical Android device (mine was connected via USB).
