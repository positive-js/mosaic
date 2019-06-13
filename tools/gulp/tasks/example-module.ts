import { sync as glob } from 'glob';
import { task } from 'gulp';
import * as path from 'path';

import { generateExampleModule } from '../../example-module/generate-example-module';
import { buildConfig } from '../../packages';


const {packagesDir} = buildConfig;

/** Path to find the examples */
const examplesPath = path.join(packagesDir, 'mosaic-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

/**
 * Creates the examples module and metadata
 */
task('build-examples-module', (done) => {
    generateExampleModule(glob(path.join(examplesPath, '**/*.ts')), outputModuleFilename);
    done();
});
