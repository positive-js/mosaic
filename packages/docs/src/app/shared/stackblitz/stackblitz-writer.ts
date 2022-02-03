/* tslint:disable:no-parameter-reassignment import-name */
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ExampleData, EXAMPLE_COMPONENTS } from '@ptsecurity/mosaic-examples';
import StackBlitzSDK from '@stackblitz/sdk';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

import { mosaicVersion } from '../version/version';


const COPYRIGHT =
    `Copyright 2022 Positive Technologies. All Rights Reserved.
    Use of this source code is governed by an MIT-style license.`;

/**
 * Path that refers to the docs-content from the "@ptsecurity/mosaic-examples" package. The
 * structure is defined in the repository, but we include the docs-content as assets in
 * the CLI configuration.
 */
const DOCS_CONTENT_PATH = 'docs-content/examples-source';
const TEMPLATE_PATH = 'assets/stackblitz/';
const PROJECT_TAGS = ['angular', 'mosaic', 'cdk', 'web', 'example'];
const PROJECT_TEMPLATE = 'node';

export const TEMPLATE_FILES = [
    '.gitignore',
    '.stackblitzrc',
    'angular.json',
    'package.json',
    'tsconfig.app.json',
    'tsconfig.json',
    'src/index.html',
    'src/main.ts',
    'src/mosaic.module.ts',
    'src/polyfills.ts',
    'src/styles.scss',
    'src/app/app.module.ts',
    'src/environments/environment.prod.ts',
    'src/environments/environment.ts'
];

type FileDictionary = {[path: string]: string};

/**
 * Stackblitz writer, write example files to stackblitz
 */
@Injectable({providedIn: 'root'})
export class StackblitzWriter {
    private fileCache = new Map<string, Observable<string>>();

    constructor(private http: HttpClient, private ngZone: NgZone) {
    }

    /**
     * Returns an HTMLFormElement that will open a new stackblitz template with the example data when
     * called with submit().
     */
    constructStackblitzForm(exampleId: string, data: ExampleData): Promise<() => void> {

        return this.ngZone.runOutsideAngular(async () => {
            const files = await this.buildInMemoryFileDictionary(data, exampleId);
            const exampleMainFile = `src/app/${data.indexFilename}`;

            return () => {
                this.openStackBlitz({
                    files,
                    title: `Angular Components - ${data.description}`,
                    description: `${data.description}\n\nAuto-generated from: https://mosaic.ptsecurity.com`,
                    openFile: exampleMainFile
                });
            };
        });
    }

    /**
     * The stackblitz template assets contain placeholder names for the examples:
     * "<mosaic-docs-example>" and "MosaicDocsExample".
     * This will replace those placeholders with the names from the example metadata,
     * e.g. "<basic-button-example>" and "BasicButtonExample"
     */
    replaceExamplePlaceholderNames(data: ExampleData,
                                   fileName: string,
                                   fileContent: string): string {

        if (fileName === 'src/index.html' || fileName === 'package.json') {
            fileContent = fileContent.replace(/\${version}/g, mosaicVersion);
        }

        if (fileName === 'src/index.html') {
            // Replace the component selector in `index,html`.
            // For example, <mosaic-docs-example></mosaic-docs-example> will be replaced as
            // <button-demo></button-demo>
            fileContent = fileContent
                .replace(/mosaic-docs-example/g, data.selectorName)
                .replace(/{{title}}/g, data.description)
                .replace(/{{version}}/g, mosaicVersion);
        } else if (fileName === '.stackblitzrc') {
            fileContent = fileContent
                .replace(/\${startCommand}/, 'turbo start');
        } else if (fileName === 'src/app/app.module.ts') {
            const joinedComponentNames = data.componentNames.join(', ');
            // Replace the component name in `main.ts`.
            // Replace `import {MosaicDocsExample} from 'mosaic-docs-example'`
            // will be replaced as `import {ButtonDemo} from './button-demo'`
            fileContent = fileContent.replace(/{ MosaicDocsExample }/g, `{${joinedComponentNames}}`);

            // Replace `declarations: [MosaicDocsExample]`
            // will be replaced as `declarations: [ButtonDemo]`
            fileContent = fileContent.replace(
                /declarations: \[MosaicDocsExample\]/g,
                `declarations: [${joinedComponentNames}]`
            );

            // Replace `entryComponents: [MosaicDocsExample]`
            // will be replaced as `entryComponents: [DialogContent]`
            fileContent = fileContent.replace(
                /entryComponents: \[MosaicDocsExample\]/g,
                `entryComponents: [${joinedComponentNames}]`
            );

            // Replace `bootstrap: [MosaicDocsExample]`
            // will be replaced as `bootstrap: [ButtonDemo]`
            // This assumes the first component listed in the main component
            fileContent = fileContent.
            replace(/bootstrap: \[MosaicDocsExample]/g,
                    `bootstrap: [${data.componentNames[0]}]`);

            const dotIndex = data.indexFilename.lastIndexOf('.');
            const importFileName = data.indexFilename.slice(0, dotIndex === -1 ? undefined : dotIndex);
            fileContent = fileContent.replace(/mosaic-docs-example/g, importFileName);
        }

        return fileContent;
    }

    private appendCopyright(filename: string, content: string): string {
        if (filename.indexOf('.ts') > -1 || filename.indexOf('.scss') > -1) {
            content = `${content}\n\n/**  ${COPYRIGHT} */`;
        } else if (filename.indexOf('.html') > -1) {
            content = `${content}\n\n<!-- ${COPYRIGHT} -->`;
        }

        return content;
    }

    private async buildInMemoryFileDictionary(data: ExampleData, exampleId: string): Promise<FileDictionary> {
        const result: FileDictionary = {};
        const tasks: Promise<unknown>[] = [];
        const liveExample = EXAMPLE_COMPONENTS[exampleId];
        const exampleBaseContentPath =
            `${DOCS_CONTENT_PATH}/${liveExample.module.importSpecifier}/${exampleId}/`;

        for (const relativeFilePath of TEMPLATE_FILES) {
            tasks.push(this.loadFile(TEMPLATE_PATH + relativeFilePath)
                // Replace example placeholders in the template files.
                .then((content) => this.replaceExamplePlaceholderNames(data, relativeFilePath, content))
                .then((content) => result[relativeFilePath] = content));
        }

        for (const relativeFilePath of data.exampleFiles) {
            // tslint:disable-next-line
            tasks.push(this.loadFile(exampleBaseContentPath + relativeFilePath)
                // Insert a copyright footer for all example files inserted into the project.
                .then((content) => this.appendCopyright(relativeFilePath, content))
                .then((content) => result[`src/app/${relativeFilePath}`] = content));
        }

        // Wait for the file dictionary to be populated. All file requests are
        // triggered concurrently to speed up the example StackBlitz generation.
        await Promise.all(tasks);

        return result;
    }

    private openStackBlitz({title, description, openFile, files}:
                                {title: string; description: string; openFile: string; files: FileDictionary}): void {
        StackBlitzSDK.openProject({
            title,
            files,
            description,
            template: PROJECT_TEMPLATE,
            tags: PROJECT_TAGS
        },                        {openFile});
    }

    private loadFile(fileUrl: string): Promise<string> {
        let stream = this.fileCache.get(fileUrl);

        if (!stream) {
            stream = this.http.get(fileUrl, {responseType: 'text'}).pipe(shareReplay(1));
            this.fileCache.set(fileUrl, stream);
        }

        // The `take(1)` is necessary, because the Promise from `toPromise` resolves on complete.
        return stream.pipe(take(1)).toPromise();
    }
}
