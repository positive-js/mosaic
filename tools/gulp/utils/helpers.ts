import * as child_process from 'child_process';
import * as gulp from 'gulp';

import { IExecTaskOptions } from './models';


const gulpClean = require('gulp-clean');
const resolveBin = require('resolve-bin');

export function cleanTask(glob: string) {
    return () => gulp.src(glob, { read: false }).pipe(gulpClean(null));
}

export function execTask(binPath: string, args: string[], options: IExecTaskOptions = {}) {
    return (done: (err?: string) => void) => {
        const env = {...process.env, ...options.env};
        const childProcess = child_process.spawn(binPath, args, {env});
        const stderrData: string[] = [];

        if (!options.silentStdout && !options.silent) {
            childProcess.stdout.on('data', (data: string) => process.stdout.write(data));
        }

        if (!options.silent || options.failOnStderr) {
            childProcess.stderr.on('data', (data: string) => {
                options.failOnStderr ? stderrData.push(data) : process.stderr.write(data);
            });
        }

        childProcess.on('close', (code: number) => {
            if (options.failOnStderr && stderrData.length) {
                done(stderrData.join('\n'));
            } else {
                code !== 0 ? done(options.errMessage || `Process failed with code ${code}`) : done();
            }
        });
    };
}

export function execNodeTask(packageName: string, executable: string | string[], args?: string[],
                             options: IExecTaskOptions = {}) {
    if (!args) {
        args = <string[]> executable;
        executable = '';
    }

    return (done: (err: any) => void) => {
        resolveBin(packageName, { executable }, (err: any, binPath: string) => {
            if (err) {
                done(err);
            } else {
                // Execute the node binary within a new child process using spawn.
                // The binary needs to be `node` because on Windows the shell cannot determine the correct
                // interpreter from the shebang.
                execTask('node', [binPath].concat(args!), options)(done);
            }
        });
    };
}
