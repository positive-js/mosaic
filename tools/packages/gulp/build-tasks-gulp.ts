import { dest, src, task } from 'gulp';
import { join } from 'path';

import { BuildPackage } from '../build-package';
import { inlineResourcesForDirectory } from '../inline-resources';

import { buildScssTask } from './build-scss-task';
import { sequenceTask } from './sequence-task';
import {composeRelease} from '../build-release';


/* tslint:disable:no-var-requires */
const htmlmin = require('gulp-htmlmin');
/* tslint:enable:no-var-requires */

const htmlMinifierOptions = {
    collapseWhitespace: true,
    removeComments: true,
    caseSensitive: true,
    removeAttributeQuotes: false
};

export function createPackageBuildTasks(buildPackage: BuildPackage, preBuildTasks: string[] = []) {

    // Name of the package build tasks for Gulp.
    const taskName = buildPackage.name;

    // Name of all dependencies of the current package.
    const dependencyNames = buildPackage.dependencies.map((p) => p.name);

    // Glob that matches all style files that need to be copied to the package output.
    const stylesGlob = join(buildPackage.sourceDir, '**/*.+(scss|css)');

    // Glob that matches every HTML file in the current package.
    const htmlGlob = join(buildPackage.sourceDir, '**/*.html');

    task(`${taskName}:build`, sequenceTask(
        ...preBuildTasks,
        ...dependencyNames.map((pkgName) => `${pkgName}:build`),
        `${taskName}:assets`,
        `${taskName}:build:esm`,
        // Inline assets into ESM output.
        `${taskName}:assets:inline`,
        // Build bundles on top of inlined ESM output.
        `${taskName}:build:bundles`
    ));

    task(`${taskName}:build-release:clean`, sequenceTask('clean', `${taskName}:build-release`));
    task(`${taskName}:build-release`, [`${taskName}:build`], () => composeRelease(buildPackage));


    task(`${taskName}:build:esm`, () => buildPackage.compile());

    task(`${taskName}:build:bundles`, () => buildPackage.createBundles());

    task(`${taskName}:assets`, [
        `${taskName}:assets:scss`,
        `${taskName}:assets:es5-scss`,
        `${taskName}:assets:copy-styles`,
        `${taskName}:assets:html`
    ]);

    task(`${taskName}:assets:scss`, buildScssTask(
        buildPackage.outputDir, buildPackage.sourceDir, true)
    );

    task(`${taskName}:assets:es5-scss`, buildScssTask(
        buildPackage.esm5OutputDir, buildPackage.sourceDir, true)
    );

    task(`${taskName}:assets:copy-styles`, () => {
        return src(stylesGlob)
            .pipe(dest(buildPackage.outputDir))
            .pipe(dest(buildPackage.esm5OutputDir));
    });
    task(`${taskName}:assets:html`, () => {
        return src(htmlGlob).pipe(htmlmin(htmlMinifierOptions))
            .pipe(dest(buildPackage.outputDir))
            .pipe(dest(buildPackage.esm5OutputDir));
    });

    task(`${taskName}:assets:inline`, () => inlineResourcesForDirectory(buildPackage.outputDir));
}
