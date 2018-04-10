

export interface IBuildConfig {

  // Current version of the project.
  projectVersion: string;

  // Required Angular version for the project.

  angularVersion: string;
  // Path to the root of the project.

  projectDir: string;

  // Path to the directory where all packages are living.
  packagesDir: string;

  // Path to the directory where the output will be stored.

  outputDir: string;

  // License banner that will be placed inside of every bundle.
  licenseBanner: string;
}

import { join, resolve } from 'path';


/* tslint:disable:no-var-requires */
const _package = require('../../package.json');
/* tslint:enable:no-var-requires */

const buildVersion = _package.version;

const angularVersion = '^6.0.0';

// License that will be placed inside of all created bundles.
const buildLicense = `/**
 * @license
 * Positive Technologies All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license.
 */`;

const rootDir = resolve(__dirname, '../..');

const buildConfig: IBuildConfig = {
    projectVersion: buildVersion,
    angularVersion,
    projectDir: rootDir,
    packagesDir: join(rootDir, 'src'),
    outputDir: join(rootDir, 'dist'),
    licenseBanner: buildLicense
};

export { buildConfig };
