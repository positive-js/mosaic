import {
    BuilderContext,
    BuilderOutput,
    Target
} from '@angular-devkit/architect';
import { Schema } from '@angular/cli/lib/config/workspace-schema';
import { green } from 'chalk';
import { promises as fs, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

import { IPackagerOptions } from './schema';


// tslint:disable-next-line:max-func-body-length
export async function packager(options: IPackagerOptions, context: BuilderContext): Promise<BuilderOutput> {

    const project = context.target !== undefined ? context.target.project : '';
    context.logger.info(`📦 Packaging ${project}...`);

    const target: Target = {
        target: options.buildTarget,
        project
    };

    let ngPackagrBuilderOptions;

    try {
        // tslint:disable-next-line:deprecation
        ngPackagrBuilderOptions = ((await context.getTargetOptions(target)) as unknown) as any;

        if (ngPackagrBuilderOptions.project === undefined) {
            throw new Error(
                '❌ Build target does not exist in angular.json'
            );
        }

    } catch (err) {
        context.logger.error(err);

        return {
            error: err,
            success: false
        };
    }

    try {
        context.logger.info('📖 angular.json file...');
        const angularJson = await tryJsonParse<Schema>(
            join(context.workspaceRoot, 'angular.json')
        );

        // get the package json
        context.logger.info('📖 package.json file...');
        const packageJson = await tryJsonParse<IPackageJson>(
            join(context.workspaceRoot, 'package.json')
        );

        const projectRoot =
            angularJson.projects &&
            angularJson.projects[project] &&
            angularJson.projects[project].root;

        if (!projectRoot) {
            context.logger.error(
                `❌ Could not find a root folder for the project ${project} in your angular.json file`
            );

            return { success: false };
        }

        const ngPackagrConfigPath = join(
            context.workspaceRoot,
            ngPackagrBuilderOptions.project
        );

        const ngPackagrConfig = await tryJsonParse<INgPackagerJson>(
            ngPackagrConfigPath
        );

        const libraryDestination = resolve(
            dirname(ngPackagrConfigPath),
            ngPackagrConfig.dest
        );

        const build = await context.scheduleTarget(target);

        const buildResult = await build.result;

        const releasePackageJsonPath = join(libraryDestination, 'package.json');
        let releasePackageJson = await tryJsonParse<IPackageJson>(
            releasePackageJsonPath
        );

        context.logger.info('Syncing Mosaic components version for releasing...');
        releasePackageJson = syncComponentsVersion(
            releasePackageJson,
            packageJson,
            options.versionPlaceholder
        );

        context.logger.info('Syncing Angular dependency versions for releasing...');
        releasePackageJson = syncNgVersion(
            releasePackageJson,
            packageJson,
            options.ngVersionPlaceholder
        );

        writeFileSync(
            join(libraryDestination, 'package.json'),
            // tslint:disable-next-line:no-magic-numbers
            JSON.stringify(releasePackageJson, null, 4),
            { encoding: 'utf-8' }
        );

        for (const additionalTargetName of options.additionalTargets) {

            context.logger.info(`Running additional target: ${additionalTargetName}`);

            const additionalTargetBuild = await context.scheduleTarget(
                parseAdditionalTargets(additionalTargetName)
            );

            const additionalTargetBuildResult = await additionalTargetBuild.result;

            if (!additionalTargetBuildResult.success) {
                throw new Error(`Running target '${additionalTargetName}' failed!`);
            }
        }

        context.logger.info(green(' ✔ Packaging done!'));

        return { success: buildResult.success };
    } catch (error) {
        context.logger.error(error);
    }

    return {
        error: 'Package failed',
        success: false
    };
}

interface INgPackagerJson {
    dest: string;
}

interface IPackageJson {
    version?: string;
    peerDependencies: {
        [key: string]: string;
    };
    dependencies: {
        [key: string]: string;
    };
}


function syncComponentsVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string
): IPackageJson {

    const newPackageJson = { ...releaseJson };

    if (
        rootPackageJson.version &&
        (!newPackageJson.version || newPackageJson.version.trim() === placeholder)
    ) {
        newPackageJson.version = rootPackageJson.version;

        for (const [key, value] of Object.entries(releaseJson.peerDependencies!)) {
            if (value.includes(placeholder)) {
                newPackageJson.peerDependencies![key] = `^${newPackageJson.version}`;
            }
        }
    }

    return newPackageJson;
}


function syncNgVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string
): IPackageJson {
    const updatedJson = { ...releaseJson };

    for (const [key, value] of Object.entries(releaseJson.peerDependencies!)) {
        if (value.includes(placeholder)) {
            updatedJson.peerDependencies![key] = rootPackageJson.dependencies![key];
        }
    }

    return updatedJson;
}

async function tryJsonParse<T>(path: string): Promise<T> {
    try {
        return JSON.parse(await fs.readFile(path, { encoding: 'utf-8' }));
    } catch (err) {
        throw new Error(`Error while parsing json file at ${path}`);
    }
}

function parseAdditionalTargets(targetRef: string): { target: string; project: string } {
    const [project, target] = targetRef.split(':');

    return { project, target };
}

