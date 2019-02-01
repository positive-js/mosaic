import { createPackageBuildTasks } from '../packages';

import { cdkPackage, examplesPackage, mosaicPackage, mosaicDateAdapterPackage } from './packages';

/* tslint:disable:no-import-side-effect ordered-imports */
// THIS ORDER OF IMPORTS AND CALLS IS IMPORTANT
import './tasks/clean';
import './tasks/example-module';


createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(mosaicDateAdapterPackage);
createPackageBuildTasks(mosaicPackage);
createPackageBuildTasks(examplesPackage, ['build-examples-module']);

import './tasks/lint';
import './tasks/unit';
import './tasks/ci';
import './tasks/mosaic-release';
import './tasks/docs';
import './tasks/payload';
import './tasks/changelog';
import './tasks/validate-licenses';
/* tslint:enable:no-import-side-effect */
