import { createPackageBuildTasks } from '../packages';

import { cdkPackage, examplesPackage, mosaicPackage } from './packages';


createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(mosaicPackage);
createPackageBuildTasks(examplesPackage, ['build-examples-module']);

/* tslint:disable:no-import-side-effect */
import './tasks/clean';
import './tasks/ci';
import './tasks/lint';
import './tasks/mosaic-release';
import './tasks/unit';
import './tasks/example-module';
import './tasks/docs';
import './tasks/payload';
import './tasks/changelog';
/* tslint:enable:no-import-side-effect */
