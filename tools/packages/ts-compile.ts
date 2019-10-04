import * as chalk from 'chalk';
import { spawn } from 'child_process';
import { resolve as resolvePath } from 'path';


/* tslint:disable:no-console */
/**
 * Spawns a child process that compiles TypeScript using the specified compiler binary.
 * @param binary Binary name that will be used for TS compilation.
 * @param flags Command-line flags to be passed to binary.
 * @returns Promise that resolves/rejects when the child process exits.
 */
export function tsCompile(binary: 'tsc' | 'ngc', flags: string[]) {

    // tslint:disable-next-line
    return new Promise((resolve, reject) => {
        const binaryPath = resolvePath(`./node_modules/.bin/${binary}`);
        const childProcess = spawn(binaryPath, flags, {shell: true});

        // Pipe stdout and stderr from the child process.
        childProcess.stdout.on('data', (data: string | Buffer) => console.log(`${data}`));
        childProcess.stderr.on('data', (data: string | Buffer) => console.error(chalk.default.red(`${data}`)));
        childProcess.on('exit', (exitCode: number) => {
            // tslint:disable-next-line
            exitCode === 0 ? resolve() : reject(`${binary} compilation failure`);
        });
    });
}

/* tslint:enable:no-console */
