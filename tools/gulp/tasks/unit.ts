import { task, series } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../../packages';


const defaultOptions = {
    configFile: join(buildConfig.projectDir, 'tests/karma.conf.js'),
    autoWatch: false,
    singleRun: false
};

task(':test:build', series(
    'clean',
    'cdk:build-no-bundles',
    'mosaic-date-adapters:build-no-bundles',
    'mosaic:build-no-bundles'
));

task('test:single-run', series(':test:build', (done: () => void) => {

    const karma = require('karma');

    new karma.Server({...defaultOptions, singleRun: true}, (exitCode: number) => {
        // Immediately exit the process if Karma reported errors, because due to
        // potential still running tunnel-browsers gulp won't exit properly.
        exitCode === 0 ? done() : process.exit(exitCode);
    }).start();
}));
