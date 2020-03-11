import { task } from 'gulp';

import { execNodeTask } from '../utils/helpers';


/** Globs that match all SCSS or CSS files that should be linted. */
const styleGlobs = [
    'packages/**/*.+(css|scss)',
    '--config', '.stylelintrc',
    '--syntax', 'scss'
];

const tsLintBaseFlags = ['-c', 'tslint.json', '--project', './tsconfig.json'];

task('tslint', execNodeTask('tslint', tsLintBaseFlags));
task('tslint:json', execNodeTask('tslint',
    [...tsLintBaseFlags, '--format', 'json', '--out', './dist/reports/tslint.json']));

task('stylelint', execNodeTask('stylelint', [...styleGlobs]));

task('stylelint:json', execNodeTask('stylelint',
    [...styleGlobs, '-f', 'json', '--output-file', './dist/reports/stylelint.json']));

task('tslint:fix', execNodeTask('tslint', [...tsLintBaseFlags, '--fix']));
