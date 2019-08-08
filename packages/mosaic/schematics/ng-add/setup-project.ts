import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import {
    addModuleImportToRootModule,
    getProjectFromWorkspace,
    getProjectMainFile, getProjectStyleFile,
    hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import chalk from 'chalk';

import { addRobotoFonts } from './fonts/roboto-fonts';
import { Schema } from './schema';
import { addThemeToAppStyles } from './theming/theming';


/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.module
 */
// tslint:disable-next-line:no-default-export
export default function(options: Schema): Rule {
    return chain([
        noop(),
        addAnimationsModule(options),
        addThemeToAppStyles(options),
        addRobotoFonts(options),
        addMosaicAppStyles(options)
    ]);
}

/** Name of the Angular module that enables Angular browser animations. */
const browserAnimationsModuleName = 'BrowserAnimationsModule';

/** Name of the module that switches Angular animations to a noop implementation. */
const noopAnimationsModuleName = 'NoopAnimationsModule';

function addAnimationsModule(options: Schema) {
    return (host: Tree) => {

        const workspace = getWorkspace(host);
        const project = getProjectFromWorkspace(workspace, options.project);

        const appModulePath = getAppModulePath(host, getProjectMainFile(project));

        if (options.animations) {
            if (hasNgModuleImport(host, appModulePath, noopAnimationsModuleName)) {
                return console.warn(chalk.red(`Could not set up "${chalk.bold(browserAnimationsModuleName)}" ` +
                    `because "${chalk.bold(noopAnimationsModuleName)}" is already imported. Please manually ` +
                    `set up browser animations.`));
            }

            addModuleImportToRootModule(host, browserAnimationsModuleName,
                '@angular/platform-browser/animations', project);
        } else if (!hasNgModuleImport(host, appModulePath, browserAnimationsModuleName)) {
            // Do not add the NoopAnimationsModule module if the project already explicitly uses
            // the BrowserAnimationsModule.
            addModuleImportToRootModule(host, noopAnimationsModuleName,
                '@angular/platform-browser/animations', project);
        }

        return host;
    };
}

function addMosaicAppStyles(options: Schema) {
    return (host: Tree) => {
        const workspace = getWorkspace(host);
        const project = getProjectFromWorkspace(workspace, options.project);
        const styleFilePath = getProjectStyleFile(project);

        if (!styleFilePath) {
            console.warn(chalk.red(`Could not find the default style file for this project.`));
            console.warn(chalk.red(`Please consider manually setting up the Roboto font in your CSS.`));

            return;
        }

        const buffer = host.read(styleFilePath);

        if (!buffer) {
            console.warn(chalk.red(`Could not read the default style file within the project ` +
                `(${chalk.italic(styleFilePath)})`));
            console.warn(chalk.red(`Please consider manually setting up the Robot font.`));

            return;
        }

        const htmlContent = buffer.toString();
        // tslint:disable-next-line:prefer-template
        const insertion = '\n' +
            `html, body { height: 100%; }\n` +
            `body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`;

        if (htmlContent.includes(insertion)) {
            return;
        }

        const recorder = host.beginUpdate(styleFilePath);

        recorder.insertLeft(htmlContent.length, insertion);
        host.commitUpdate(recorder);
    };
}
