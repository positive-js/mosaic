
import { join, resolve } from 'path';


/* tslint:disable:no-var-requires */
const packageJSON = require('../../package.json');
/* tslint:enable:no-var-requires */

const angularVersion = packageJSON.requiredAngularVersion;

const rootDir = resolve(__dirname, '../..');

const buildConfig = {
    angularVersion,
    projectDir: rootDir,
    packagesDir: join(rootDir, 'packages'),
    outputDir: join(rootDir, 'dist')
};

export { buildConfig };
