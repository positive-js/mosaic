import { src, dest } from 'gulp';
import { join } from 'path';


/* tslint:disable:no-var-requires */
const gulpSass = require('gulp-sass');
const gulpIf = require('gulp-if');
const gulpCleanCss = require('gulp-clean-css');
/* tslint:enable:no-var-requires */

export function buildScssTask(outputDir: string, sourceDir: string, minifyOutput = false) {
  return () => {
    return src(join(sourceDir, '**/*.scss'))
      .pipe(gulpSass().on('error', gulpSass.logError))
      .pipe(gulpIf(minifyOutput, gulpCleanCss()))
      .pipe(dest(outputDir));
  };
}
