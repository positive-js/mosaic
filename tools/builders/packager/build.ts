import {
    BuilderContext,
    BuilderOutput,
    Target
} from '@angular-devkit/architect';
import { NgPackagrBuilderOptions } from '@angular-devkit/build-ng-packagr';

import { IPackagerOptions } from './schema';


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

    return { success: false };
}
