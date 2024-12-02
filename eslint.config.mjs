// Copyright 2024, University of Colorado Boulder

import browserEslintConfig from '../perennial-alias/js/eslint/config/browser.eslint.config.mjs';

/**
 * ESLint configuration for quake.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
export default [
  ...browserEslintConfig,
  {
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