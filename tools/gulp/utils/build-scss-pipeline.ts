import { src } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../build-config';


/* tslint:disable:no-var-requires */
const gulpSass = require('gulp-sass');
const sass = require('sass');
const gulpIf = require('gulp-if');
const gulpCleanCss = require('gulp-clean-css');
/* tslint:enable:no-var-requires */

const sassIncludePaths = [
    join(buildConfig.projectDir, 'node_modules/')
];

// Set the compiler to our version of `node-sass`, rather than the one that `gulp-sass` depends on.
gulpSass.compiler = sass;

export function buildScssPipeline(sourceDir: string, minifyOutput = false) {
    return src(join(sourceDir, '**/*.scss'))
        .pipe(gulpSass({includePaths: sassIncludePaths}).on('error', gulpSass.logError))
        .pipe(gulpIf(minifyOutput, gulpCleanCss()));
}
