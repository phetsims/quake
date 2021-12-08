Setting Up Quake to Build the Haptics Playground Apps
=====================================================

The quake repo is the home for a multi-platform app that allows users to experiment with haptics on different devices.
The app uses Apache Cordova, which enables developers to write code in HTML, JavaScript, and CSS, and then build the
app to run on different platforms.  This document describes the steps necessary to set up the build environment.

It is assumed that `node` and `npm` are already set up and available.

1. Install Android Studio.  The SDKs are needed to build the Android app.
2. If cordova isn't already installed, install it globally using `npm install -g cordova`
3. Pull the contents of the repo.  This repo has no dependencies on other PhET repos, so it isn't necessary to pull any
others.
4. Run `npm install` to get the needed node modules
5. Run `cordova platform add android` to install the Android platform files
6. Run `cordova platform add ios` to install the iOS platform files
7. Run `cordove build` to build the app

TODO: @jbphet 12/6/2021 - This needs refinement and testing, and maybe expansion, but at least it's a start.