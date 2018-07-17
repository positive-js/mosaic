import { mkdirpSync, writeFileSync } from 'fs-extra';
import { task, src, dest } from 'gulp';
import { join } from 'path';
import { Bundler } from 'scss-bundle';

import { buildConfig, sequenceTask } from '../../packages';
import { composeRelease } from '../../packages/build-release';
import { mosaicPackage } from '../packages';


const gulpRename = require('gulp-rename');

const distDir = buildConfig.outputDir;
const {sourceDir, outputDir} = mosaicPackage;

/** Path to the directory where all releases are created. */
const releasesDir = join(distDir, 'releases');

// Matches all SCSS files in the different packages.
const allScssGlob = join(buildConfig.packagesDir, '**/*.scss');


// Path to the release output of mosaic.
const releasePath = join(releasesDir, 'mosaic');
// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(sourceDir, 'core', 'theming', '_all-theme.scss');
// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');
// Matches all pre-built theme css files
const prebuiltThemeGlob = join(outputDir, '**/theming/prebuilt/*.css?(.map)');


const visualEntryPointPath = join(sourceDir, 'core', 'visual', '_all-visual.scss');
const prebuiltVisualGlob = join(outputDir, '**/visual/prebuilt/*.css?(.map)');
const visualBundlePath = join(releasePath, '_visual.scss');

task('mosaic:build-release', ['mosaic:prepare-release'], () => composeRelease(mosaicPackage));

task('mosaic:prepare-release', sequenceTask(
    'mosaic:build',
    [
        'mosaic:copy-prebuilt-themes', 'mosaic:bundle-theming-scss',
        'mosaic:copy-prebuilt-visual', 'mosaic:bundle-visual-scss'
    ]
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
    return new Bundler().Bundle(themingEntryPointPath, [allScssGlob]).then((result) => {
        // The release directory is not created yet because the composing of the release happens when
        // this task finishes.
        mkdirpSync(releasePath);
        writeFileSync(themingBundlePath, result.bundledContent);
    });
});


task('mosaic:copy-prebuilt-visual', () => {
    src(prebuiltVisualGlob)
        .pipe(gulpRename({dirname: ''}))
        .pipe(dest(join(releasePath, 'prebuilt-visual')));
});

task('mosaic:bundle-visual-scss', () => {
    // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
    // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
    // array of globs, which will match SCSS files that will be only included once in the bundle.
    return new Bundler().Bundle(visualEntryPointPath, [allScssGlob]).then((result) => {
        // The release directory is not created yet because the composing of the release happens when
        // this task finishes.
        mkdirpSync(releasePath);
        writeFileSync(visualBundlePath, result.bundledContent);
    });
});
