// Copyright 2024-2025, University of Colorado Boulder

/**
 * Build the Haptics Playground app for all supported platforms
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
// Copyright 2024, University of Colorado Boulder

/**
 * Default command which runs lint-project, report-media, clean, and build.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

( async () => {
  await ( await import( '../../../../perennial-alias/js/grunt/tasks/lint.js' ) ).lintPromise;

  await import( './build.js' );

  await import( './install-plugin.js' );
} )();