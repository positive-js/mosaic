import { task, series, parallel } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../../packages';
import { execNodeTask } from '../utils/helpers';


const { packagesDir } = buildConfig;

/** Path to the dev-app source directory. */
const devAppSource = join(packagesDir, 'dev-app');

/** Path to the tsconfig file that builds the AOT files. */
const tsconfigFile = join(devAppSource, 'tsconfig-aot.json');


/** Builds the dev-app assets and builds the required release packages. */
task('build-aot:release-packages', parallel(
    'cdk:build-release',
    'mosaic-moment-adapter:build-release',
    'mosaic:build-release',
    'mosaic-examples:build-release'
));

/**
 * Task that builds the assets which are required for building with AOT. Since the dev-app uses
 * Sass files, we need to provide the transpiled CSS sources in the package output.
 */
task('build-aot:assets', parallel(':build:devapp:assets', ':build:devapp:scss'));

/** Build the dev-app and a release to confirm that the library is AOT-compatible. */
task('build-aot:compiler-cli', execNodeTask(
    '@angular/compiler-cli', 'ngc', ['-p', tsconfigFile]
));

/**
 * Build the dev-app wit the release output in order confirm that the library is
 * working with AOT compilation enabled.
 */
task('build-aot', series(
    'clean',
    parallel('build-aot:release-packages', 'build-aot:assets'),
    'build-aot:compiler-cli'
));

/**
 * Task that can be used to build the dev-app with AOT without building the
 * release output. This can be run if the release output is already built.
 */
task('build-aot:no-release-build', series('build-aot:assets', 'build-aot:compiler-cli'));
