import { createPackageBuildTasks } from '../packages';

import { mosaicPackage } from './packages';


createPackageBuildTasks(mosaicPackage);

/* tslint:disable:no-import-side-effect */
import './tasks/clean';
import './tasks/lint';
/* tslint:enable:no-import-side-effect */
