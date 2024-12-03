// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for quake grunt.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import nodeEslintConfig from '../../../perennial-alias/js/eslint/config/node.eslint.config.mjs';
import { mutateForNestedConfig } from '../../../perennial-alias/js/eslint/config/root.eslint.config.mjs';

export default [
  ...mutateForNestedConfig( nodeEslintConfig ),
  {
    // TODO: remove once the path works in root config again, https://github.com/phetsims/chipper/issues/1483/
    rules: {
      '@typescript-eslint/no-floating-promises': 'off'
    }
  }
];