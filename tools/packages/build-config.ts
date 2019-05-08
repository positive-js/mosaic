
import { join, resolve } from 'path';


/* tslint:disable:no-var-requires */
const _package = require('../../package.json');
/* tslint:enable:no-var-requires */

const buildVersion = _package.version;

const angularVersion = _package.requiredAngularVersion;

// License that will be placed inside of all created bundles.
const buildLicense = `/**
 * @license
 * Positive Technologies All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license.
 */`;

const rootDir = resolve(__dirname, '../..');

const buildConfig = {
    projectVersion: buildVersion,
    angularVersion,
    projectDir: rootDir,
    packagesDir: join(rootDir, 'packages'),
    outputDir: join(rootDir, 'dist'),
    licenseBanner: buildLicense
};

export { buildConfig };
