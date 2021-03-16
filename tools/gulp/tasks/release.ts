import { copySync } from 'fs-extra';
import { series, task } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../build-config';
import { cleanTask, execNodeTask } from '../utils/helpers';


const releaseDir = join(buildConfig.projectDir, 'tools/release');
const tsconfigLibTestFile = join(releaseDir, 'tsconfig.spec.json');
const targetPath = join(buildConfig.outputDir, 'release-test');


task('clean:release-test', cleanTask([targetPath]));

task('build:release-test', execNodeTask(
    'typescript',
    'tsc',
    [ '-p', tsconfigLibTestFile ]
));

task('test:release', execNodeTask(
    'jasmine',
    'jasmine',
    [ 'dist/release-test/**/*.spec.js' ]
));

task('unit:release', series(
    'clean:release-test',
    'build:release-test',
    'test:release'
));
