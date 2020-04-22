import { copySync } from 'fs-extra';
import { series, task } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../build-config';
import { cleanTask, execNodeTask } from '../utils/helpers';


const schematicsDir = join(buildConfig.packagesDir, 'mosaic/schematics');
const tsconfigLibTestFile = join(schematicsDir, 'tsconfig.lib-test.json');
const targetPath = join(buildConfig.outputDir, 'schematics-test');


task('clean:schematics-test', cleanTask([targetPath]));

task('build:schematics-test', execNodeTask(
    'typescript',
    'tsc',
    [ '-p', tsconfigLibTestFile ]
));

task('test:schematics-update', execNodeTask(
    'jasmine',
    'jasmine',
    [ 'dist/schematics-test/ng-update/test-cases/**/*.spec.js' ]
));

task('schematics:copy-fixtures', (done) => {
    copySync(schematicsDir, targetPath);
    done();
});

task('unit:schematics', series(
    'clean:schematics-test',
    'build:schematics-test',
    'schematics:copy-fixtures',
    'test:schematics-update'
));
