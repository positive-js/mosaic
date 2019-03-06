// tslint:disable:no-var-requires
import { task, dest, series, parallel } from 'gulp';
import { join } from 'path';

import { buildConfig, buildScssPipeline, copyFiles } from '../../packages';
import { inlineResourcesForDirectory } from '../../packages/inline-resources';
import {
    cdkPackage,
    mosaicPackage,
    momentAdapterPackage,
    examplesPackage
} from '../packages';
import { tsBuildTask, copyTask, serverTask } from '../utils/helpers';
import { watchFilesAndReload } from '../utils/watch-files-reload';


const { outputDir, packagesDir } = buildConfig;

const appDir = join(packagesDir, 'dev-app');
const outDir = join(outputDir, 'packages', 'dev-app');


/** Array of vendors that are required to serve the dev-app. */
const appVendors = [
    '@angular',
    'systemjs',
    'zone.js',
    'rxjs',
    'hammerjs',
    'core-js',
    'moment',
    'tslib',
    '@webcomponents'
];

/** Glob that matches all assets that need to be copied to the output. */
const assetsGlob = join(appDir, `**/*.+(html|css|svg|ico)`);

/** Path to the dev-app tsconfig file. */
const tsconfigPath = join(appDir, 'tsconfig-build.json');

task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:assets', copyTask(assetsGlob, outDir));
task(':build:devapp:scss', () => buildScssPipeline(appDir).pipe(dest(outDir)));
task(':build:devapp:inline-resources', () => inlineResourcesForDirectory(outDir));

task(':serve:devapp', serverTask(outDir));

task('build:devapp', series(
    'cdk:build-no-bundles',
    'mosaic-moment-adapter:build-no-bundles',
    'mosaic:build-no-bundles',
    'build-examples-module',
    // The examples module needs to be manually built before building examples package because
    // when using the `no-bundles` task, the package-specific pre-build tasks won't be executed.
    'mosaic-examples:build-no-bundles',
    parallel(':build:devapp:assets', ':build:devapp:scss', ':build:devapp:ts'),
    // Inline all component resources because otherwise SystemJS tries to load HTML, CSS and
    // JavaScript files which makes loading the dev-app extremely slow.
    ':build:devapp:inline-resources'
));


/*
 * Development app watch task. This task ensures that only the packages that have been affected
 * by a file-change are being rebuilt. This speeds-up development and makes working on Mosaic
 * easier.
 */
task(':watch:devapp', () => {
    watchFilesAndReload(join(appDir, '**/*.ts'), [':build:devapp:ts']);
    watchFilesAndReload(join(appDir, '**/*.scss'), [':watch:devapp:rebuild-scss']);
    watchFilesAndReload(join(appDir, '**/*.html'), [':watch:devapp:rebuild-html']);

    // Custom watchers for all packages that are used inside of the dev-app. This is necessary
    // because we only want to build the changed package (using the build-no-bundles task).

    // CDK package watchers.
    watchFilesAndReload(join(cdkPackage.sourceDir, '**/*'), ['cdk:build-no-bundles']);

    const mosaicCoreThemingGlob = join(
        mosaicPackage.sourceDir,
        '**/core/+(theming|typography)/**/*.scss'
    );

    // Mosaic package watchers.
    watchFilesAndReload([
        join(mosaicPackage.sourceDir, '**/!(*-theme.scss)'), `!${mosaicCoreThemingGlob}`
    ], ['mosaic:build-no-bundles']);
    watchFilesAndReload([
        join(mosaicPackage.sourceDir, '**/*-theme.scss'), mosaicCoreThemingGlob
    ], [':build:devapp:scss']);

    // Moment adapter package watchers
    watchFilesAndReload(join(momentAdapterPackage.sourceDir, '**/*'),
        ['mosaic-moment-adapter:build-no-bundles']);

    // Example package watchers.
    watchFilesAndReload(join(examplesPackage.sourceDir, '**/*'),
        ['mosaic-examples:build-no-bundles']);
});

// task('serve:devapp', ['build:devapp'], sequenceTask([':serve:devapp', ':watch:devapp']));
task('serve:devapp', series('build:devapp', parallel(':serve:devapp', ':watch:devapp')));

// Note that we need to rebuild the TS here, because the resource inlining
// won't work if the file's resources have been inlined already.
task(':watch:devapp:rebuild-scss', series(
    parallel(':build:devapp:scss', ':build:devapp:ts'),
    ':build:devapp:inline-resources'
));

task(':watch:devapp:rebuild-html', series(
    parallel(':build:devapp:assets', ':build:devapp:ts'),
    ':build:devapp:inline-resources'
));
