# quake
quake is a repo for experimental haptics apps and HTML pages

# Setting up the Build Environment

In order to be able to build the app, there are a number of things that must be set up on the build machine.  To date
(Jan 2022), all of the work for this has been done on Windows, and the requirements are specified for that environment.

The app is build using Apache Cordova.  There are several things that must be installed.  If working through the items
on this list doesn't get the build working, please reference https://cordova.apache.org/docs/en/10.x/guide/cli/.

It is assumed that npm and NodeJS are already present on the machine. 

The following must be available to build the project:
- Java JDK.  The original development was done with version 1.8.0_311, and the `java -version` command output the
following as its first line: `java version "1.8.0_311"`
- Android SDK.  This can be obtained by installing Android Studio, which is free.  When asked what version of the API is
needed, specify 30 and 31.
- Cordova, which can be installed using the command `npm install -g cordova`
- I (jbphet) had to explicitly install gradle, though it seemed like it should be available with Android studio.  You
can either install it explicitly of figure out how to use the version that supposedly comes with Android Studio.
- Check the requirements using `cordove requirements` and iterate until it passes.  More on this at 
https://cordova.apache.org/docs/en/10.x/guide/cli/#install-pre-requisites-for-building

Once the pre-requisites have been installed, run the following commands to install the supported platforms:
- `cordova platform add android`
- `cordova platform add browser`

# Building the App

Once the environment is set up, the app can be built using the command `cordova build`.  Alternatively, `grunt` will
build, and will also run lint (prior to the actual build step).