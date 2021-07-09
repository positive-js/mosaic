import { ensureDirSync, copySync } from 'fs-extra';
import { dirname } from 'path';


// tslint:disable-next-line:blank-lines
if (require.main === module) {

    // copy Stackblitz Examples
    const outDir = [
        'dist/docs-content/examples-source/mosaic',
        'dist/docs-content/examples-source/mosaic-common'
    ];
    const execPath = [
        'packages/mosaic-examples/mosaic/',
        'packages/mosaic-examples/mosaic-common/'
    ];

    for (let i = 0; i < execPath.length; i++) {
        ensureDirSync(dirname(outDir[i]));

        copySync(execPath[i], outDir[i], {
            filter: (path) => {
                return !/.json/.test(path);
            }
        });
    }
}
