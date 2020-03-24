// tslint:disable:no-var-requires
import * as child_process from 'child_process';


const resolveBin = require('resolve-bin');


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
    // tslint:disable:no-parameter-reassignment
    if (!args) {
        args = <string[]> executable;
        executable = '';
    }
    // tslint:enable:no-parameter-reassignment

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


/** Gulp 4 watch function uses unix style paths even on windows and we should keep it unix styled */
export function replaceSlashes(value: string | string[]): string | string[] {
    if (typeof value !== 'string' && !Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => replaceSlashes(item) as string);
    }

    return value.replace(/\\/g, '/');
}

// Options that can be passed to execTask or execNodeTask.
export interface IExecTaskOptions {

    // Whether STDOUT and STDERR messages should be printed.
    silent?: boolean;

    // Whether STDOUT messages should be printed.
    silentStdout?: boolean;

    // If an error happens, this will replace the standard error.
    errMessage?: string;

    // Environment variables being passed to the child process.
    env?: any;

    // Whether the task should fail if the process writes to STDERR.
    failOnStderr?: boolean;
}
