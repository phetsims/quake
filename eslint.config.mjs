// Copyright 2024, University of Colorado Boulder

import { getBrowserConfiguration } from '../chipper/eslint/browser.eslint.config.mjs';
import { getNodeConfiguration } from '../chipper/eslint/node.eslint.config.mjs';
import rootEslintConfig from '../chipper/eslint/root.eslint.config.mjs';

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
        alert: 'readonly',
        chooser: 'readonly',
        cordova: 'readonly',
        // TODO: Aren't many of these redundant with the browser globals? https://github.com/phetsims/chipper/issues/1485
        navigator: 'readonly',
        nativeVibration: 'readonly',
        Response: 'readonly',
        XMLHttpRequest: 'readonly'
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