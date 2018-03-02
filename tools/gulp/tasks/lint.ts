import { task } from 'gulp';

import { execNodeTask } from '../utils/helpers';


const tsLintBaseFlags = ['-c', 'tslint.json', '--project', './tsconfig.json'];

task('lint', ['tslint']);

task('tslint', execNodeTask('tslint', tsLintBaseFlags));
