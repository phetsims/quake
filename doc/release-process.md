Releasing the Haptics Playground App on the Google Play Store
=============================================================

You'll need an account on the Google Play Store with the appropriate permissions in order to do a release.  If you don't
have this, work with CU OIT to get set up.

- [ ] Make sure the version number is correct and matches in the `package.json` file and the `config.xml` file that both
exist at the top level of the `quake` repo.
- [ ] Build and test on master, verify that this release is ready to publish.
- [ ] Tag the current SHA in git using the command `git tag -a <version> -m "<short-explanatory-message>"` where the
<version> matches the string in the `package.json` and `config.xml` files, and the message is a short description of the
reasons for the release.
- 
