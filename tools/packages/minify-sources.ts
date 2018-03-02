import { writeFileSync } from 'fs';
import { basename } from 'path';
import { MinifyOptions } from 'uglify-js';


/* tslint:disable:no-var-requires */
const uglify = require('uglify-js');
/* tslint:enable:no-var-requires */


/**
 * Minifies a JavaScript file by using UglifyJS2. Also writes sourcemaps to the output.
 */
export function uglifyJsFile(inputPath: string, outputPath: string) {
    const sourceMapPath = `${outputPath}.map`;

    const minifyOptions: MinifyOptions = {
        inSourceMap: `${inputPath}.map`,
        outSourceMap: basename(sourceMapPath)
    };

    const result = uglify.minify(inputPath, minifyOptions);

    writeFileSync(outputPath, result.code);
    writeFileSync(sourceMapPath, result.map);
}
