import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import { sync as glob } from 'glob';
import { task } from 'gulp';

import { buildConfig } from '../../packages';


const { packagesDir } = buildConfig;

interface IExampleMetadata {
    component: string;
    sourcePath: string;
    id: string;
    title: string;
    additionalComponents: string[];
    additionalFiles: string[];
    selectorName: string[];
}

interface IParsedMetadata {
    primary: boolean;
    component: string;
    title: string;
    templateUrl: string;
}

interface IParsedMetadataResults {
    primaryComponent: IParsedMetadata;
    secondaryComponents: IParsedMetadata[];
}

/** Path to find the examples */
const examplesPath = path.join(packagesDir, 'mosaic-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

/** Build ES module import statements for the examples. */
function buildImportsTemplate(metadata: IExampleMetadata): string {
    const components = metadata.additionalComponents.concat(metadata.component);

    // Create a relative path to the source file of the current example.
    // The relative path will be used inside of a TypeScript import statement.
    const relativeSrcPath = path
        .relative(examplesPath, metadata.sourcePath)
        .replace(/\\/g, '/')
        .replace('.ts', '');

    return `import {${components.join(',')}} from './${relativeSrcPath}';
`;
}

/**
 * Builds the examples metadata including title, component, etc.
 */
function buildExamplesTemplate(metadata: IExampleMetadata): string {
    const fields = [
        `title: '${metadata.title.trim()}'`,
        `component: ${metadata.component}`
    ];

    // if no additional files or selectors were provided,
    // return null since we don't care about if these were not found
    if (metadata.additionalFiles.length) {
        fields.push(`additionalFiles: ${JSON.stringify(metadata.additionalFiles)}`);
    }

    if (metadata.selectorName.length) {
        fields.push(`selectorName: '${metadata.selectorName.join(', ')}'`);
    }

    // tslint:disable-next-line
    const data = '\n' + fields.map((field) => '    ' + field).join(',\n');

    return `'${metadata.id}': {${data}
  },
  `;
}

/**
 * Build the list of components template
 */
function buildListTemplate(metadata: IExampleMetadata): string {
    const components = metadata.additionalComponents.concat(metadata.component);

    return `${components.join(',')},
  `;
}

/**
 * Builds the template for the examples module
 */
function generateExampleNgModule(extractedMetadata: IExampleMetadata[]): string {
    return `
/* tslint:disable */
/** DO NOT MANUALLY EDIT THIS FILE, IT IS GENERATED VIA GULP 'build-examples-module' */
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ExampleMosaicModule} from './mosaic-module';
${extractedMetadata.map(buildImportsTemplate).join('').trim()}

export interface LiveExample {
  title: string;
  component: any;
  additionalFiles?: string[];
  selectorName?: string;
}

export const EXAMPLE_COMPONENTS: {[key: string]: LiveExample} = {
  ${extractedMetadata.map(buildExamplesTemplate).join('').trim()}
};

export const EXAMPLE_LIST = [
  ${extractedMetadata.map(buildListTemplate).join('').trim()}
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    ExampleMosaicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ExampleModule { }
`;
}

/**
 * Given a string that is a camel or pascal case,
 * this function will convert to dash case.
 */
function convertToDashCase(name: string): string {
    // tslint:disable-next-line
    name = name.replace(/[A-Z]/g, ' $&');
    // tslint:disable-next-line
    name = name.toLowerCase().trim();

    return name.split(' ').join('-');
}

/**
 * Parse the AST of a file and get metadata about it
 */
function parseExampleMetadata(fileName: string, sourceContent: string): IParsedMetadataResults {
    const sourceFile = ts.createSourceFile(
        fileName, sourceContent, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

    const metas: any[] = [];

    const visit = (node: any): void => {
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            const meta: any = {
                component: node.name.text
            };

            if (node.jsDoc && node.jsDoc.length) {
                for (const doc of node.jsDoc) {
                    if (doc.tags && doc.tags.length) {
                        for (const tag of doc.tags) {
                            const tagValue = tag.comment;
                            const tagName = tag.tagName.text;
                            if (tagName === 'title') {
                                meta.title = tagValue;
                                meta.primary = true;
                            }
                        }
                    }
                }
            }

            if (node.decorators && node.decorators.length) {
                for (const decorator of node.decorators) {
                    if (decorator.expression.expression.text === 'Component') {
                        for (const arg of decorator.expression.arguments) {
                            for (const prop of arg.properties) {
                                const name = prop.name.text;
                                meta[name] = prop.initializer.text;
                            }
                        }

                        metas.push(meta);
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
        primaryComponent: metas.find((m) => m.primary),
        secondaryComponents: metas.filter((m) => !m.primary)
    };
}

/**
 * Creates the examples module and metadata
 */
task('build-examples-module', () => {
    const results: IExampleMetadata[] = [];
    const matchedFiles = glob(path.join(examplesPath, '**/*.ts'));

    for (const sourcePath of matchedFiles) {
        const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
        const {primaryComponent, secondaryComponents} =
            parseExampleMetadata(sourcePath, sourceContent);

        if (primaryComponent) {
            // Generate a unique id for the component by converting the class name to dash-case.
            const id = convertToDashCase(primaryComponent.component.replace('Example', ''));

            const example: IExampleMetadata = {
                sourcePath,
                id,
                component: primaryComponent.component,
                title: primaryComponent.title,
                additionalComponents: [],
                additionalFiles: [],
                selectorName: []
            };

            if (secondaryComponents.length) {
                example.selectorName.push(example.component);

                for (const meta of secondaryComponents) {
                    example.additionalComponents.push(meta.component);
                    if (meta.templateUrl) {
                        example.additionalFiles.push(meta.templateUrl);
                    }
                    example.selectorName.push(meta.component);
                }
            }

            results.push(example);
        }
    }

    const generatedModuleFile = generateExampleNgModule(results);
    fs.writeFileSync(outputModuleFilename, generatedModuleFile);
});
