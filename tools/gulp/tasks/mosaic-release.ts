import {task, src, dest} from 'gulp';
import {Bundler} from 'scss-bundle';

import { mosaicPackage } from '../packages';
import {composeRelease} from '../../packages/build-release';
import {buildConfig, sequenceTask} from '../../packages';
import {join} from "path";
import {mkdirpSync, writeFileSync} from 'fs-extra';

const gulpRename = require('gulp-rename');

const distDir = buildConfig.outputDir;
const {sourceDir, outputDir} = mosaicPackage;

/** Path to the directory where all releases are created. */
const releasesDir = join(distDir, 'releases');

// Path to the release output of mosaic.
const releasePath = join(releasesDir, 'mosaic');
// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(sourceDir, 'core', 'theming', '_all-theme.scss');
// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');
// Matches all pre-built theme css files
const prebuiltThemeGlob = join(outputDir, '**/theming/prebuilt/*.css?(.map)');
// Matches all SCSS files in the different packages.
const allScssGlob = join(buildConfig.packagesDir, '**/*.scss');


task('mosaic:build-release', ['mosaic:prepare-release'], () => composeRelease(mosaicPackage));

task('mosaic:prepare-release', sequenceTask(
    'mosaic:build',
    ['mosaic:copy-prebuilt-themes', 'mosaic:bundle-theming-scss']
));

task('mosaic:copy-prebuilt-themes', () => {
    src(prebuiltThemeGlob)
        .pipe(gulpRename({dirname: ''}))
        .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task('mosaic:bundle-theming-scss', () => {
    // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
    // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
    // array of globs, which will match SCSS files that will be only included once in the bundle.
    return new Bundler().Bundle(themingEntryPointPath, [allScssGlob]).then(result => {
        // The release directory is not created yet because the composing of the release happens when
        // this task finishes.
        mkdirpSync(releasePath);
        writeFileSync(themingBundlePath, result.bundledContent);
    });
});
