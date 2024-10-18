// Copyright 2024, University of Colorado Boulder

/**
 * Build the Haptics Playground app for all supported platforms
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
// Copyright 2024, University of Colorado Boulder

/**
 * Default command which runs lint-all, report-media, clean, and build.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

( async () => {
  // TODO: Comment back in when completed with: https://github.com/phetsims/chipper/issues/1489
  // await ( await import( '../../../../perennial-alias/js/grunt/tasks/lint.js' ) ).lintTask;

  await import( './build.ts' );

  await import( './install-plugin.ts' );
} )();