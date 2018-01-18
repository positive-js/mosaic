/**
 * Build configuration for the packaging tool. This file will be automatically detected and used
 * to build the different packages inside of Material.
 */
const { join } = require('path');

const package = require('./package.json');

/** Current version of the project*/
const buildVersion = package.version;

const mosaicVersion = '0.0.1';

/** License that will be placed inside of all created bundles. */
const buildLicense = `/**
 * @license
 * Positive Technologies All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license.
 */`;

module.exports = {
  projectVersion: buildVersion,
  angularVersion: mosaicVersion,
  projectDir: __dirname,
  packagesDir: join(__dirname, 'src'),
  outputDir: join(__dirname, 'dist'),
  licenseBanner: buildLicense
};
