import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

import { addPackageToPackageJson, getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';
import { mosaicVersion, requiredAngularVersionRange } from './version-names';


// tslint:disable-next-line:no-default-export
export default function(options: Schema): Rule {

    return (host: Tree, context: SchematicContext) => {

        const ngCoreVersionTag = getPackageVersionFromPackageJson(host, '@angular/core');
        const angularDependencyVersion = ngCoreVersionTag || requiredAngularVersionRange;

        addPackageToPackageJson(host, '@angular/cdk', angularDependencyVersion);
        addPackageToPackageJson(host, '@angular/forms', angularDependencyVersion);
        addPackageToPackageJson(host, '@angular/animations', angularDependencyVersion);
        addPackageToPackageJson(host, '@ptsecurity/cdk', `~${mosaicVersion}`);
        addPackageToPackageJson(host, '@ptsecurity/mosaic', `~${mosaicVersion}`);

        const installTaskId = context.addTask(new NodePackageInstallTask());

        context.addTask(new RunSchematicTask('ng-add-setup-project', options), [installTaskId]);
    };
}
