import { join } from 'path';

import { PackageBundler } from './build-bundles';
import { buildConfig } from './build-config';
import {
    addImportAsToAllMetadata,
    compileEntryPoint,
    renamePrivateReExportsToBeUnique
} from './compile-entry-point';
import { getSecondaryEntryPointsForPackage } from './secondary-entry-points';


const { packagesDir, outputDir } = buildConfig;

// Name of the tsconfig file that is responsible for building an ES2015 package.
const buildTsConfigName = 'tsconfig.build.json';

const testsTsconfigName = 'tsconfig.tests.json';

export class BuildPackage {

    /**
     * Path to the package sources.
     */
    sourceDir: string;

    /**
     * Path to the ES2015 package output.
     */
    outputDir: string;

    /**
     * Path to the ES5 package output.
     */
    esm5OutputDir: string;

    /**
     * Whether this package will re-export its secondary-entry points at the root module.
     */
    exportsSecondaryEntryPointsAtRoot = false;

    /**
     * Whether the secondary entry-point styles should be copied to the release output.
     */
    copySecondaryEntryPointStylesToRoot = false;

    /** Whether the build package has schematics or not. */
    hasSchematics = false;

    /**
     * Path to the entry file of the package in the output directory.
     */
    readonly entryFilePath: string;

    /**
     * Path to the tsconfig file, which will be used to build the package.
     */
    private readonly tsconfigBuild: string;

    /**
     * Package bundler instance.
     */
    private bundler = new PackageBundler(this);

    /**
     * Secondary entry-points partitioned by their build depth.
     */
    private get secondaryEntryPointsByDepth(): string[][] {
        this.cacheSecondaryEntryPoints();

        return this._secondaryEntryPointsByDepth;
    }
    private _secondaryEntryPointsByDepth: string[][];

    /**
     * Secondary entry points for the package.
     */
    get secondaryEntryPoints(): string[] {
        this.cacheSecondaryEntryPoints();

        return this._secondaryEntryPoints;
    }
    private _secondaryEntryPoints: string[];

    constructor(readonly name: string, readonly dependencies: BuildPackage[] = []) {
        this.sourceDir = join(packagesDir, name);
        this.outputDir = join(outputDir, 'packages', name);
        this.esm5OutputDir = join(outputDir, 'packages', name, 'esm5');

        this.tsconfigBuild = join(this.sourceDir, buildTsConfigName);

        this.entryFilePath = join(this.outputDir, 'index.js');
    }

    async compile() {

        for (const entryPointGroup of this.secondaryEntryPointsByDepth) {
            await Promise.all(entryPointGroup.map((p) => this._compileBothTargets(p)));
        }

        // Compile the primary entry-point.
        await this._compileBothTargets();
    }

    /** Compiles the TypeScript test source files for the package. */
    async compileTests() {
        return compileEntryPoint(this, testsTsconfigName)
            .then(() => addImportAsToAllMetadata(this));
    }

    async createBundles() {
        await this.bundler.createBundles();
    }

    /**
     * Compiles TS into both ES2015 and ES5, then updates exports.
     */
    private async _compileBothTargets(p = '') {
        return compileEntryPoint(this, buildTsConfigName, p)
            .then(() => compileEntryPoint(this, buildTsConfigName, p, this.esm5OutputDir))
            .then(() => renamePrivateReExportsToBeUnique(this, p));
    }

    /**
     * Stores the secondary entry-points for this package if they haven't been computed already.
     */
    private cacheSecondaryEntryPoints() {
        if (!this._secondaryEntryPoints) {
            this._secondaryEntryPointsByDepth = getSecondaryEntryPointsForPackage(this);
            this._secondaryEntryPoints =
                this._secondaryEntryPointsByDepth.reduce((list, p) => list.concat(p), []);
        }
    }
}
