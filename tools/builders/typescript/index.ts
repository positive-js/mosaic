import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { ExecOptions, exec } from 'child_process';
import { statSync } from 'fs';
import { join } from 'path';

import { ITypescriptBuilderOptions } from './schema';


export async function executeCommand(command: string, cwd?: string): Promise<string> {
    // tslint:disable-next-line:no-magic-numbers
    const maxBuffer = 1024 * 1024 * 10;

    const options: ExecOptions = {
        cwd: cwd || process.cwd(),
        maxBuffer
    };

    return new Promise((resolve, reject) => {
        exec(command, options, (err, stdout) => {
            if (err !== null) {
                reject(stdout);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function run(options: ITypescriptBuilderOptions, context: BuilderContext): Promise<BuilderOutput> {
    const configFile = join(context.workspaceRoot, options.tsConfig);

    let outDirArgument = '';

    if (options.outDir) {
        outDirArgument = ` --outDir ${join(context.workspaceRoot, options.outDir)}`;
    }

    if (!statSync(configFile).isFile()) {
        context.logger.error(
            'No tsconfig.json file found for compiling. Please provide it via the tsConfig option.'
        );

        return {
            success: false
        };
    }

    try {
        const logOutput = await executeCommand(
            `node_modules/.bin/tsc -p ${configFile}${outDirArgument}`
        );

        if (logOutput) {
            context.logger.info(logOutput);
        }
    } catch (error) {
        context.logger.error(error);

        return {
            success: false
        };
    }

    return {
        success: true
    };
}

// tslint:disable-next-line:no-default-export
export default createBuilder<ITypescriptBuilderOptions & JsonObject>(run);
