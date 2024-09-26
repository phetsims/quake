// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for quake.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import nodeEslintConfig from '../chipper/eslint/node.eslint.config.mjs';

export default [
  ...nodeEslintConfig,
  {
    languageOptions: {
      globals: {
        alert: 'readonly',
        chooser: 'readonly',
        cordova: 'readonly',
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