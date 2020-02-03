import * as chalk from 'chalk';
import { task, parallel, series } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../../packages';
import { execNodeTask } from '../utils/helpers';


/* tslint:disable:no-console */
/* tslint:disable:no-var-requires */
const madge = require('madge');

/** Globs that matchall SCSS or CSS files that should be linted. */
const styleGlobs = [
    'packages/**/*.+(css|scss)'
];

const tsLintBaseFlags = ['-c', 'tslint.json', '--project', './tsconfig.json'];

/** Path to the output of the Mosaic package. */
const mosaicOutPath = join(buildConfig.outputDir, 'packages', 'mosaic');

/** Path to the output of the CDK package. */
const cdkOutPath = join(buildConfig.outputDir, 'packages', 'cdk');

/** Path to the output of the mosaic-moment-adapter package. */
const mosaicMomentAdaptersOutPath = join(buildConfig.outputDir, 'packages', 'mosaic-moment-adapter');

task('tslint', execNodeTask('tslint', tsLintBaseFlags));

task('stylelint', execNodeTask(
    'stylelint', [...styleGlobs, '--config', '.stylelintrc', '--syntax', 'scss']
));

task('tslint:fix', execNodeTask('tslint', [...tsLintBaseFlags, '--fix']));

task('madge', series('mosaic:clean-build', () => {
    madge([mosaicOutPath, cdkOutPath, mosaicMomentAdaptersOutPath]).then((res: any) => {
        const circularModules = res.circular();

        if (circularModules.length) {
            console.error();
            console.error(chalk.default.red(`Madge found modules with circular dependencies.`));
            console.error(formatMadgeCircularModules(circularModules));
            console.error();
        }
    });
}));

task('lint', parallel('tslint', 'madge'));

/** Returns a string that formats the graph of circular modules. */
function formatMadgeCircularModules(circularModules: string[][]): string {
    return circularModules.map((modulePaths: string[]) => `\n - ${modulePaths.join(' > ')}`).join('');
}
