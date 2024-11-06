// Copyright 2024, University of Colorado Boulder

import { getBrowserConfiguration } from '../perennial-alias/js/eslint/browser.eslint.config.mjs';
import getNodeConfiguration from '../perennial-alias/js/eslint/config/util/getNodeConfiguration.mjs';
import rootEslintConfig from '../perennial-alias/js/eslint/root.eslint.config.mjs';

const nodeFiles = [
  'js/grunt/**/*',
  'cordova-plugin-native-vibration/www/**/*',
  'cordova-plugin-native-vibration/src/browser/**/*'
];

const browserFilesPattern = {
  files: [ '**/*' ],
  ignores: nodeFiles
};

/**
 * ESLint configuration for quake.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
export default [
  ...rootEslintConfig,
  ...getBrowserConfiguration( browserFilesPattern ),
  ...getNodeConfiguration( { files: nodeFiles } ),
  {
    ...browserFilesPattern,
    languageOptions: {
      globals: {
        cordova: 'readonly',
        nativeVibration: 'readonly'
      }
    }
  },
  {
    ignores: [
      'platforms/',
      'plugins/'
    ]
  }
];