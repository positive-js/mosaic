import { watch, series, TaskFunction } from 'gulp';

import { replaceSlashes } from '../../gulp/utils/helpers';


/** Function that watches a set of file globs and runs given Gulp tasks if a given file changes. */
export function watchFiles(fileGlob: string | string[], tasks: (string | TaskFunction)[],
                           debounceDelay = 700) {
    watch(replaceSlashes(fileGlob), { delay: debounceDelay },  series.apply(series, tasks));
}
