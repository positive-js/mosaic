import { Rule, Tree } from '@angular-devkit/schematics';

import { addPackageToPackageJson } from './package-config';


/** Name of the CDK version that is shipped together with the schematics. */
export const cdkVersion = loadPackageVersionGracefully('@ptsecurity/cdk');

/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @ptsecurity/cdk`.
 */
// tslint:disable-next-line:no-default-export
export default function(): Rule {
    return (host: Tree) => {
        // By default, the CLI already installs the package that has been installed through `ng add`.
        // We just store the version in the `package.json` in case the package manager didn't.
        addPackageToPackageJson(host, '@ptsecurity/cdk', `^${cdkVersion}`);
    };
}

/** Loads the full version from the given Angular package gracefully. */
function loadPackageVersionGracefully(packageName: string): string | null {
    try {
        // tslint:disable-next-line:non-literal-require
        return require(`${packageName}/package.json`).version;
    } catch {
        return null;
    }
}
