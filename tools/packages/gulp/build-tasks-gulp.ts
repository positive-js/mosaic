import { dest, src, task } from 'gulp';
import { join } from 'path';

import { BuildPackage } from '../build-package';

import { sequenceTask } from './sequence-task';


export function createPackageBuildTasks(buildPackage: BuildPackage, preBuildTasks: string[] = []) {

    // Name of the package build tasks for Gulp.
    const taskName = buildPackage.name;

    // Name of all dependencies of the current package.
    const dependencyNames = buildPackage.dependencies.map((p) => p.name);

    // Glob that matches all style files that need to be copied to the package output.
    const stylesGlob = join(buildPackage.sourceDir, '**/*.+(scss|css)');

    // Glob that matches every HTML file in the current package.
    const htmlGlob = join(buildPackage.sourceDir, '**/*.html');

    // List of watch tasks that need run together with the watch task of the current package.
    const dependentWatchTasks = buildPackage.dependencies.map((p) => `${p.name}:watch`);

    task(`${taskName}:build`, sequenceTask(
        ...preBuildTasks
    ));
}
