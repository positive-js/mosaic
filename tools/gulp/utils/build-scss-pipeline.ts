import { src } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../build-config';


/* tslint:disable:no-var-requires */
const gulpSass = require('gulp-sass')(require('sass'));
const gulpIf = require('gulp-if');
const gulpCleanCss = require('gulp-clean-css');
/* tslint:enable:no-var-requires */

const sassIncludePaths = [
    join(buildConfig.projectDir, 'node_modules/')
];

export function buildScssPipeline(sourceDir: string, minifyOutput = false) {
    return src(join(sourceDir, '**/*.scss'))
        .pipe(gulpSass({includePaths: sassIncludePaths}).on('error', gulpSass.logError))
        .pipe(gulpIf(minifyOutput, gulpCleanCss()));
}
