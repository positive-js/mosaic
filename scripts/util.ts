import * as cp from 'child_process';
import * as path from 'path';


export type BaseFn = (command: string) => string;

export function exec(
    command: string,
    args: string[],
    base: BaseFn = fromNpm
): Promise<string> {
    return new Promise((resolve, reject) => {
        cp.exec(base(command) + ' ' + args.join(' '), (err, stdout) => {
            if (err) {
                return reject(err);
            }

            resolve(stdout.toString());
        });
    });
}

export function cmd(command: string, args: string[]): Promise<string> {
    return exec(command, args, (command: string) => command);
}

export function git(args: string[]): Promise<string> {
    return cmd('git', args);
}

export function fromNpm(command: string) {
    return baseDir(`./node_modules/.bin/${command}`);
}

export function baseDir(...dirs: string[]): string {
    return `"${path.resolve(__dirname, '../', ...dirs)}"`;
}
