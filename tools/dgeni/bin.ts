/* tslint:disable:no-shadowed-variable no-unnecessary-callback-wrapper */
import { ReadTypeScriptModules } from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import { TsParser } from 'dgeni-packages/typescript/services/TsParser';
import { sync as globSync } from 'glob';
import { join, relative, resolve, basename } from 'path';

import { apiDocsPackage } from './docs-package';


const execRootPath = process.cwd();

const projectRootDir = resolve(__dirname, '../..');
const packagePath = resolve(projectRootDir, 'packages');
const outputDirPath = resolve(projectRootDir, 'dist/docs-content/api-docs');

/** List of CDK packages that need to be documented. */
const cdkPackages = globSync(join(packagePath, 'cdk', '*/'))
    .filter((packagePath) => !packagePath.endsWith('testing/'))
    .map((packagePath) => basename(packagePath));

/** List of Mosaic date adapters packages that need to be documented. */
const mosaicDateAdaptersPackages = globSync(join(packagePath, 'mosaic-moment-adapter', '*/'))
    .map((packagePath) => basename(packagePath));

/** List of Mosaic packages that need to be documented. */
const mosaicPackages = globSync(join(packagePath, 'mosaic', '*/'))
    .map((packagePath) => basename(packagePath));

export const apiDocsPackageConfig = apiDocsPackage.config(function(readTypeScriptModules: ReadTypeScriptModules,
                                                                   tsParser: TsParser,
                                                                   templateFinder: any,
                                                                   writeFilesProcessor: any,
                                                                   readFilesProcessor: any) {

    // Set the base path for the "readFilesProcessor" to the execroot. This is necessary because
    // otherwise the "writeFilesProcessor" is not able to write to the specified output path.
    readFilesProcessor.basePath = execRootPath;

    // Set the base path for parsing the TypeScript source files to the directory that includes
    // all sources. This makes it easier for custom processors (such as the `entry-point-grouper)
    // to compute entry-point paths.
    readTypeScriptModules.basePath = packagePath;

    // Initialize the "tsParser" path mappings. These will be passed to the TypeScript program
    // and therefore use the same syntax as the "paths" option in a tsconfig.
    tsParser.options.paths = {};

    const typescriptPathMap: any = {};

    cdkPackages.forEach((packageName) => {
        typescriptPathMap[`@ptsecurity/cdk/${packageName}`] =
            [`./cdk/${packageName}/index.ts`];
    });

    mosaicDateAdaptersPackages.forEach((packageName) => {
        typescriptPathMap[`@ptsecurity/mosaic-moment-adapter/${packageName}`] =
            [`./mosaic-moment-adapter/${packageName}/index.ts`];
    });

    mosaicPackages.forEach((packageName) => {
        typescriptPathMap[`@ptsecurity/mosaic/${packageName}`] =
            [`./mosaic/${packageName}/index.ts`];
    });

    readTypeScriptModules.sourceFiles = [
        ...cdkPackages.map((packageName) => `./cdk/${packageName}/index.ts`),
        ...mosaicDateAdaptersPackages.map((packageName) => `./mosaic-moment-adapter/${packageName}/index.ts`),
        ...mosaicPackages.map((packageName) => `./mosaic/${packageName}/index.ts`)
    ];

    tsParser.options.paths = typescriptPathMap;
    // Base URL for the `tsParser`. The base URL refer to the directory that includes all
    // package sources that need to be processed by Dgeni.
    tsParser.options.baseUrl = packagePath;

    // This is ensures that the Dgeni TypeScript processor is able to parse node modules such
    // as the Angular packages which might be needed for doc items. e.g. if a class implements
    // the "AfterViewInit" interface from "@angular/core". This needs to be relative to the
    // "baseUrl" that has been specified for the "tsParser" compiler options.
    tsParser.options.paths!['*'] = [relative(packagePath, 'external/npm/node_modules/*')];

    // Since our base directory is the Bazel execroot, we need to make sure that Dgeni can
    // find all templates needed to output the API docs.
    templateFinder.templateFolders = [join(execRootPath, 'tools/dgeni/templates/')];

    // The output path for files will be computed by joining the output folder with the base path
    // from the "readFilesProcessors".
    writeFilesProcessor.outputFolder = outputDirPath;
});
