import { ensureDirSync, copySync } from 'fs-extra';
import { dirname } from 'path';


// tslint:disable-next-line:blank-lines
if (require.main === module) {

    const outDir = 'dist/mosaic/design-tokens';
    const execPath = 'packages/mosaic/design-tokens';

    ensureDirSync(dirname(outDir));

    copySync(`${execPath}/tokens`, `${outDir}/tokens`);

    copySync(`${execPath}/style-dictionary`, `${outDir}/style-dictionary`);
}
