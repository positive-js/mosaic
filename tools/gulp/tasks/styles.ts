import { mkdirpSync, writeFileSync } from 'fs-extra';
import { task, dest, series, parallel } from 'gulp';
import { join } from 'path';
import { Bundler } from 'scss-bundle';

import { buildConfig } from '../build-config';
import { buildScssPipeline } from '../utils/build-scss-pipeline';


const sourceDir = `${buildConfig.packagesDir}/mosaic`;

/** Path to the directory where all releases are created. */
const releasesDir = buildConfig.outputDir;

// Matches all SCSS files in the different packages. Note that this glob is not used to build
// the bundle. It's used to identify Sass files that shouldn't be included multiple times.
const allScssDedupeGlob = join(buildConfig.packagesDir, '**/*.scss');


// Path to the release output of mosaic.
const releasePath = join(releasesDir, 'mosaic');
// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(sourceDir, 'core', 'theming', '_all-theme.scss');
// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');


const visualEntryPointPath = join(sourceDir, 'core', 'visual', '_all-visual.scss');
const visualBundlePath = join(releasePath, '_visual.scss');


/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task('mosaic:bundle-theming-scss', () => {
    // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
    // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
    // array of globs, which will match SCSS files that will be only included once in the bundle.
    return new Bundler().bundle(themingEntryPointPath, [allScssDedupeGlob]).then((result) => {
        // The release directory is not created yet because the composing of the release happens when
        // this task finishes.
        mkdirpSync(releasePath);
        writeFileSync(themingBundlePath, result.bundledContent as string);
    });
});

task('mosaic:bundle-visual-scss', () => {
    // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
    // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
    // array of globs, which will match SCSS files that will be only included once in the bundle.
    return new Bundler().bundle(visualEntryPointPath, [allScssDedupeGlob]).then((result) => {
        // The release directory is not created yet because the composing of the release happens when
        // this task finishes.
        mkdirpSync(releasePath);
        writeFileSync(visualBundlePath, result.bundledContent as string);
    });
});

task('mosaic:prebuilt-themes:scss', () => {
    return buildScssPipeline(`${sourceDir}/core/theming/prebuilt`, true)
        .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

task('mosaic:prebuilt-visual:scss', () => {
    return buildScssPipeline(`${sourceDir}/core/visual/prebuilt`, true)
        .pipe(dest(join(releasePath, 'prebuilt-visual')));
});

task('styles:built-all', series(
    parallel(
        'mosaic:bundle-theming-scss',
        'mosaic:bundle-visual-scss',
        'mosaic:prebuilt-themes:scss',
        'mosaic:prebuilt-visual:scss'
    )
));
