import { join } from 'path';

import { buildConfig } from './build-config';
import { BuildPackage } from './build-package';
import { dashCaseToCamelCase } from './utils';


/**
 * Directory where all bundles will be created in.
 */
const bundlesDir = join(buildConfig.outputDir, 'bundles');

/**
 * Utility for creating bundles from raw ngc output.
 */
export class PackageBundler {
    constructor(private buildPackage: BuildPackage) {}

    /**
     * Bundles the primary entry-point w/ given entry file
     */
    private async bundlePrimaryEntryPoint() {
        const packageName = this.buildPackage.name;

        return this.bundleEntryPoint({
            entryFile: this.buildPackage.entryFilePath,
            esm5EntryFile: join(this.buildPackage.esm5OutputDir, 'index.js'),
            moduleName: `ng.${this.buildPackage.name}`,
            esm2015Dest: join(bundlesDir, `${packageName}.js`),
            esm5Dest: join(bundlesDir, `${packageName}.es5.js`),
            umdDest: join(bundlesDir, `${packageName}.umd.js`),
            umdMinDest: join(bundlesDir, `${packageName}.umd.min.js`),
        });
    }

    /**
     * Bundles a single secondary entry-point w/ given entry file
     */
    private async bundleSecondaryEntryPoint(entryPoint: string) {
        const packageName = this.buildPackage.name;
        const entryFile = join(this.buildPackage.outputDir, entryPoint, 'index.js');
        const esm5EntryFile = join(this.buildPackage.esm5OutputDir, entryPoint, 'index.js');

        return this.bundleEntryPoint({
            entryFile,
            esm5EntryFile,
            moduleName: `ng.${packageName}.${dashCaseToCamelCase(entryPoint)}`,
            esm2015Dest: join(bundlesDir, `${packageName}`, `${entryPoint}.js`),
            esm5Dest: join(bundlesDir, `${packageName}`, `${entryPoint}.es5.js`),
            umdDest: join(bundlesDir, `${packageName}-${entryPoint}.umd.js`),
            umdMinDest: join(bundlesDir, `${packageName}-${entryPoint}.umd.min.js`),
        });
    }

    /**
     * Creates the ES5, ES2015, and UMD bundles for the specified entry-point.
     * @param config Configuration that specifies the entry-point, module name, and output
     *     bundle paths.
     */
    private async bundleEntryPoint(config: IBundlesConfig) {

    }
}

/**
 * Configuration for creating library bundles.
 */
interface IBundlesConfig {
    entryFile: string;
    esm5EntryFile: string;
    moduleName: string;
    esm2015Dest: string;
    esm5Dest: string;
    umdDest: string;
    umdMinDest: string;
}

/**
 * Configuration for creating a bundle via rollup.
 */
interface IRollupBundleConfig {
    entry: string;
    dest: string;
    format: string;
    moduleName: string;
}
