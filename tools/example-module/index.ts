/* tslint:disable:naming-convention no-reserved-keywords */
import fs from 'fs';
import * as path from 'path';

import { buildConfig } from '../gulp/build-config';

import { parseExampleFile } from './parse-example-file';
import { parseExampleModuleFile } from './parse-example-module-file';


const {packagesDir} = buildConfig;

/** Path to find the examples */
const examplesPath = path.join(packagesDir, 'mosaic-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

interface ExampleMetadata {
    /** Name of the example component. */
    componentName: string;
    /** Path to the source file that declares this example. */
    sourcePath: string;
    /** Path to the directory containing this example. */
    packagePath: string;
    /** Selector to match the component of this example. */
    selector: string;
    /** Unique id for this example. */
    id: string;
    /** Title of the example. */
    title: string;
    /** Additional components for this example. */
    additionalComponents: string[];
    /** Files for this example. */
    files: string[];
    /** Reference to the module that declares this example. */
    module: ExampleModule;
}

interface ExampleModule {
    /** Path to the package that the module is defined in. */
    packagePath: string;
    /** Name of the module. */
    name: string;
}

interface AnalyzedExamples {
    exampleMetadata: ExampleMetadata[];
}

function inlineExampleModuleTemplate(parsedData: AnalyzedExamples): string {
    const {exampleMetadata} = parsedData;
    const exampleComponents = exampleMetadata.reduce((result, data) => {
        if (result[data.id] !== undefined) {
            throw Error(`Multiple examples with the same id have been discovered: ${data.id}`);
        }

        result[data.id] = {
            packagePath: data.packagePath,
            title: data.title,
            componentName: data.componentName,
            files: data.files,
            selector: data.selector,
            additionalComponents: data.additionalComponents,
            primaryFile: path.basename(data.sourcePath),
            module: {
                name: data.module.name,
                importSpecifier: data.module.packagePath
            }
        };

        return result;
    },                                               {} as any);

    return fs
        .readFileSync(require.resolve('./example-module.template'), 'utf8')
        .replace(/\${exampleComponents}/g, JSON.stringify(exampleComponents,
                                                          null,
            // tslint:disable-next-line:no-magic-numbers
                                                          4));
}

function convertToDashCase(name: string): string {
    // tslint:disable-next-line:no-parameter-reassignment
    name = name.replace(/[A-Z]/g, ' $&');
    // tslint:disable-next-line:no-parameter-reassignment
    name = name.toLowerCase().trim();

    return name.split(' ').join('-');
}

function assertReferencedExampleFileExists(
    baseDir: string,
    examplePackagePath: string,
    relativePath: string
) {
    if (!fs.existsSync(path.join(baseDir, examplePackagePath, relativePath))) {
        throw Error(
            `Example "${examplePackagePath}" references "${relativePath}", but file does not exist.`
        );
    }
}

// tslint:disable-next-line:max-func-body-length
function analyzeExamples(sourceFiles: string[], baseDir: string): AnalyzedExamples {
    const exampleMetadata: ExampleMetadata[] = [];
    const exampleModules: ExampleModule[] = [];

    for (const sourceFile of sourceFiles) {
        const relativePath = path.relative(baseDir, sourceFile).replace(/\\/g, '/');
        const importPath = relativePath.replace(/\.ts$/, '');
        const packagePath = path.dirname(relativePath);

        // Collect all individual example modules.
        if (path.basename(sourceFile) === 'index.ts') {
            exampleModules.push(
                ...parseExampleModuleFile(sourceFile).map((name) => ({
                    name,
                    importPath,
                    packagePath
                }))
            );
        }

        // Avoid parsing non-example files.
        if (!path.basename(sourceFile, path.extname(sourceFile)).endsWith('-example')) {
            continue;
        }

        const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
        const {primaryComponent, secondaryComponents} = parseExampleFile(sourceFile, sourceContent);

        if (primaryComponent) {
            // Generate a unique id for the component by converting the class name to dash-case.
            const exampleId = convertToDashCase(primaryComponent.componentName.replace('Example', ''));
            const example: ExampleMetadata = {
                sourcePath: relativePath,
                packagePath,
                id: exampleId,
                selector: primaryComponent.selector,
                componentName: primaryComponent.componentName,
                title: primaryComponent.title.trim(),
                additionalComponents: [],
                files: [],
                module: null
            };

            // For consistency, we expect the example component selector to match
            // the id of the example.
            const expectedSelector = `${exampleId}-example`;
            if (primaryComponent.selector !== expectedSelector) {
                throw Error(
                    `Example ${exampleId} uses selector: ${primaryComponent.selector}, ` +
                    `but expected: ${expectedSelector}`
                );
            }

            example.files.push(path.basename(relativePath));
            if (primaryComponent.templateUrl) {
                example.files.push(primaryComponent.templateUrl);
            }
            if (primaryComponent.styleUrls) {
                example.files.push(...primaryComponent.styleUrls);
            }
            if (primaryComponent.componentName.includes('Harness')) {
                // tslint:disable-next-line:prefer-template
                example.files.push(primaryComponent.selector + '.spec.ts');
            }

            if (secondaryComponents.length) {
                for (const meta of secondaryComponents) {
                    example.additionalComponents.push(meta.componentName);
                    if (meta.templateUrl) {
                        example.files.push(meta.templateUrl);
                    }
                    if (meta.styleUrls) {
                        example.files.push(...meta.styleUrls);
                    }
                }
            }

            // Ensure referenced files actually exist in the example.
            example.files.forEach((f) => assertReferencedExampleFileExists(baseDir, packagePath, f));
            exampleMetadata.push(example);
        } else {
            throw Error(
                `Could not find a primary example component in ${sourceFile}. ` +
                `Ensure that there's a component with an @title annotation.`
            );
        }
    }

    // Walk through all collected examples and find their parent example module. In View Engine,
    // components cannot be lazy-loaded without the associated module being loaded.
    exampleMetadata.forEach((example) => {
        const parentModule = exampleModules.find((module) =>
            example.sourcePath.startsWith(module.packagePath)
        );

        if (!parentModule) {
            throw Error(`Could not determine example module for: ${example.id}`);
        }

        const actualPath = path.dirname(example.sourcePath);
        const expectedPath = path.posix.join(parentModule.packagePath, example.id);

        // Ensures that example ids match with the directory they are stored in. This is not
        // necessary for the docs site, but it helps with consistency and makes it easy to
        // determine an id for an example. We also ensures for consistency that example
        // folders are direct siblings of the module file.
        if (actualPath !== expectedPath) {
            throw Error(`Example is stored in: ${actualPath}, but expected: ${expectedPath}`);
        }

        example.module = parentModule;
    });

    return {exampleMetadata};
}

// tslint:disable-next-line:no-magic-numbers
export function generateExampleModule(
    sourceFiles: string[],
    outputFile: string,
    baseDir: string = path.dirname(outputFile)
) {
    const analysisData = analyzeExamples(sourceFiles, baseDir);
    const generatedModuleFile = inlineExampleModuleTemplate(analysisData);

    fs.writeFileSync(outputFile, generatedModuleFile);
}
