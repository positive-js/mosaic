import { sync as glob } from 'glob';
import * as path from 'path';

import { buildConfig } from '../gulp/build-config';

import { generateExampleModule } from './generate-example-module';


const {packagesDir} = buildConfig;

/** Path to find the examples */
const examplesPath = path.join(packagesDir, 'mosaic-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

// tslint:disable-next-line:no-magic-numbers
generateExampleModule(glob(path.join(examplesPath, '**/*.ts')), outputModuleFilename);
