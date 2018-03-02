import { task } from 'gulp';

import { buildConfig } from '../../packages/build-config';
import { cleanTask } from '../utils/helpers';


task('clean', cleanTask(buildConfig.outputDir));
