import { ensureDirSync, copySync } from 'fs-extra';
import { dirname } from 'path';


// tslint:disable-next-line:blank-lines
if (require.main === module) {

    // copy Stackblitz Examples
    const outDir = 'dist/docs-content/examples-source/mosaic';
    const execPath = 'packages/mosaic-examples/mosaic/';

    ensureDirSync(dirname(outDir));

    copySync(execPath, outDir, {
        filter: (path) => {
            return !/.json/.test(path);
        }
    });
}
