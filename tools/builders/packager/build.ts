import {
    BuilderContext,
    BuilderOutput,
    Target
} from '@angular-devkit/architect';
import { NgPackagrBuilderOptions } from '@angular-devkit/build-ng-packagr';
import { Schema as AngularJson } from '@angular/cli/lib/config/schema';
import chalk from 'chalk';
import { existsSync, promises as fs, writeFileSync } from 'fs';
import { sync } from 'glob';
import { dirname, join, relative, resolve } from 'path';
import { parseDir } from 'sass-graph';

import { IPackagerOptions } from './schema';


// tslint:disable-next-line:max-func-body-length
export async function packager(options: IPackagerOptions, context: BuilderContext): Promise<BuilderOutput> {

    const project = context.target !== undefined ? context.target.project : '';
    context.logger.info(`Packaging ${project}...`);

    const target: Target = {
        target: options.buildTarget,
        project
    };
    let ngPackagrBuilderOptions;

    try {
        ngPackagrBuilderOptions = ((await context.getTargetOptions(
            target
        )) as unknown) as NgPackagrBuilderOptions;

        if (ngPackagrBuilderOptions.project === undefined) {
            throw new Error(
                'Error: Build target does not exist in angular.json'
            );
        }
    } catch (err) {
        context.logger.error(err);

        return { success: false };
    }

    try {
        context.logger.info('Reading angular.json file...');
        const angularJson = await tryJsonParse<AngularJson>(
            join(context.workspaceRoot, 'angular.json')
        );

        // get the package json
        context.logger.info('Reading package.json file...');
        const packageJson = await tryJsonParse<IPackageJson>(
            join(context.workspaceRoot, 'package.json')
        );

        const projectRoot =
            angularJson.projects &&
            angularJson.projects[project] &&
            angularJson.projects[project].root;

        if (!projectRoot) {
            context.logger.error(
                `Error: Could not find a root folder for the project ${project} in your angular.json file`
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

        // Determine the library destination
        const libraryDestination = resolve(
            dirname(ngPackagrConfigPath),
            ngPackagrConfig.dest
        );

        // Start build
        const build = await context.scheduleTarget(target);

        const buildResult = await build.result;

        // Path to the package json file that we are going to ship with the library
        const releasePackageJsonPath = join(libraryDestination, 'package.json');
        let releasePackageJson = await tryJsonParse<IPackageJson>(
            releasePackageJsonPath
        );

        context.logger.info('Syncing components version for releasing...');
        releasePackageJson = syncComponentsVersion(
            releasePackageJson,
            packageJson,
            options.versionPlaceholder
        );

        context.logger.info('Syncing angular dependency versions for releasing...');
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
        context.logger.info(
            chalk.green('Replaced all version placeholders in package.json file!')
        );

        context.logger.info('Copying styles...');
        await copyStyles(options, context);
        context.logger.info(chalk.green('Copied styles!'));

        context.logger.info(chalk.green('Packaging done!'));

        return { success: buildResult.success };
    } catch (error) {
        context.logger.error(error);
    }

    return { success: false };
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

interface IPackagerAssetDef {
    glob: string;
    input: string;
    output: string;
}

function parseAdditionalTargets(targetRef: string): { target: string; project: string } {
    const [project, target] = targetRef.split(':');

    return { project, target };
}

function syncComponentsVersion(
    releaseJson: IPackageJson, rootPackageJson: IPackageJson, placeholder: string): IPackageJson {

    const newPackageJson = { ...releaseJson };

    if (
        rootPackageJson.version &&
        (!newPackageJson.version || newPackageJson.version.trim() === placeholder)
    ) {
        newPackageJson.version = rootPackageJson.version;
    }

    return newPackageJson;
}

async function copyStyles(options: IPackagerOptions, context: BuilderContext): Promise<void> {
    for (const styleDef of options.styles) {
        const fileGlob = sync(styleDef.glob, {
            cwd: join(context.workspaceRoot, styleDef.input)
        });
        const directories = fileGlob.map((path) =>
            join(context.workspaceRoot, styleDef.input, dirname(path))
        );
        const uniqueDirectories = [...new Set(directories)];
        const allStyleDependencies = uniqueDirectories.reduce((aggr: string[], dir) => {
            return aggr.concat(Object.keys(parseDir(dir).index));
        }, [] as string[]);

        for (const stylesheetFilePath of allStyleDependencies) {
            await copyAsset(stylesheetFilePath, context, styleDef);
        }
    }
}

async function copyAsset(path: string, context: BuilderContext, assetDef: IPackagerAssetDef): Promise<void> {

    const relativePath = relative(join(context.workspaceRoot, assetDef.input), path);

    const destination = join(
        context.workspaceRoot,
        assetDef.output,
        relativePath
    );

    if (!existsSync(dirname(destination))) {
        await fs.mkdir(dirname(destination), { recursive: true });
    }

    await fs.copyFile(path, destination);
}
// tslint:disable
export function syncNgVersion(
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
// tslint:enable

async function tryJsonParse<T>(path: string): Promise<T> {
    try {
        return JSON.parse(await fs.readFile(path, { encoding: 'utf-8' }));
    } catch (err) {
        throw new Error(`Error while parsing json file at ${path}`);
    }
}

