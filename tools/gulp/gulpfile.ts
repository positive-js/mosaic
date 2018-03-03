import { createPackageBuildTasks } from '../packages';

import { cdkPackage, mosaicPackage } from './packages';


createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(mosaicPackage);

/* tslint:disable:no-import-side-effect */
import './tasks/clean';
import './tasks/lint';
import './tasks/mosaic-release';
/* tslint:enable:no-import-side-effect */
