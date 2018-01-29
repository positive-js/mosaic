

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

import { join } from 'path';


/* tslint:disable:no-var-requires */
const _package = require('../../package.json');
/* tslint:enable:no-var-requires */

const buildVersion = _package.version;

const angularVersion = '^5.0.0';

// License that will be placed inside of all created bundles.
const buildLicense = `/**
 * @license
 * Positive Technologies All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license.
 */`;

const buildConfig: IBuildConfig = {
    projectVersion: buildVersion,
    angularVersion,
    projectDir: __dirname,
    packagesDir: join(__dirname, 'src'),
    outputDir: join(__dirname, 'dist'),
    licenseBanner: buildLicense
};

// Load the config file using a basic CommonJS import.
export { buildConfig };
