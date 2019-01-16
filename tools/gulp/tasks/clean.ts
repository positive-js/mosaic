import { task } from 'gulp';

import { buildConfig } from '../../packages';
import { cleanTask } from '../utils/helpers';


task('clean', cleanTask(buildConfig.outputDir));
