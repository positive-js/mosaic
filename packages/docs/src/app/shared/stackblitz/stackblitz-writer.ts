/* tslint:disable:no-parameter-reassignment */
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ExampleData, EXAMPLE_COMPONENTS } from '@ptsecurity/mosaic-examples';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

import { mosaicVersion } from '../version/version';


const STACKBLITZ_URL = 'https://run.stackblitz.com/api/angular/v1';

const COPYRIGHT =
    `Copyright 2020 Positive Technologies. All Rights Reserved.
    Use of this source code is governed by an MIT-style license.`;

/**
 * Path that refers to the docs-content from the "@ptsecurity/mosaic-examples" package. The
 * structure is defined in the repository, but we include the docs-content as assets in
 * in the CLI configuration.
 */
const DOCS_CONTENT_PATH = 'docs-content/examples-source';

const TEMPLATE_PATH = 'assets/stackblitz/';
const TEMPLATE_FILES = [
    '.editorconfig',
    '.gitignore',
    'index.html',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.spec.json',
    'styles.css',
    'polyfills.ts',
    'angular.json',
    'main.ts',
    'mosaic-module.ts'
];

const TEST_TEMPLATE_PATH = 'assets/stack-blitz-tests/';
const TEST_TEMPLATE_FILES = [
    '.editorconfig',
    '.gitignore',
    'index.html',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.spec.json',
    'styles.css',
    'polyfills.ts',
    'angular.json',
    'main.ts',
    'mosaic-module.ts'
];

const TAGS: string[] = ['angular', 'mosaic', 'example'];
const angularVersion = '^12.0.0';

const dependencies = {
    '@ptsecurity/cdk': mosaicVersion,
    '@ptsecurity/mosaic': mosaicVersion,
    '@ptsecurity/mosaic-icons': '^6.1.1',
    '@ptsecurity/mosaic-luxon-adapter': mosaicVersion,
    '@ptsecurity/mosaic-moment-adapter': mosaicVersion,
    '@angular/cdk': angularVersion,
    '@angular/animations': angularVersion,
    '@angular/common': angularVersion,
    '@angular/compiler': angularVersion,
    '@angular/core': angularVersion,
    '@angular/forms': angularVersion,
    '@angular/platform-browser': angularVersion,
    '@angular/platform-browser-dynamic': angularVersion,
    '@angular/router': angularVersion,
    'core-js': '^3.6.5',
    rxjs: '^6.5.0',
    '@messageformat/core': '^2.0.5',
    tslib: '^2.0.1',
    'zone.js': '~0.10.3',
    moment: '^2.24.0',
    luxon: '^1.27.0'
};

const testDependencies = {
    '@ptsecurity/cdk': mosaicVersion,
    '@ptsecurity/mosaic': mosaicVersion,
    '@ptsecurity/mosaic-icons': '^6.1.1',
    '@ptsecurity/mosaic-luxon-adapter': mosaicVersion,
    '@ptsecurity/mosaic-moment-adapter': mosaicVersion,
    '@angular/cdk': angularVersion,
    '@angular/animations': angularVersion,
    '@angular/common': angularVersion,
    '@angular/compiler': angularVersion,
    '@angular/core': angularVersion,
    '@angular/forms': angularVersion,
    '@angular/platform-browser': angularVersion,
    '@angular/platform-browser-dynamic': angularVersion,
    '@angular/router': angularVersion,
    'core-js': '^3.6.5',
    rxjs: '^6.5.0',
    '@messageformat/core': '^2.0.5',
    tslib: '^2.0.1',
    'zone.js': '~0.10.3',
    moment: '^2.24.0',
    luxon: '^1.27.0'
};

/**
 * Stackblitz writer, write example files to stackblitz
 *
 * StackBlitz API
 * URL: https://run.stackblitz.com/api/aio/v1/
 * data: {
 *   // File name, directory and content of files
 *   files[file-name1]: file-content1,
 *   files[directory-name/file-name2]: file-content2,
 *   // Can add multiple tags
 *   tags[0]: tag-0,
 *   // Description of stackblitz
 *   description: description,
 *   // Private or not
 *   private: true
 *  // Dependencies
 *  dependencies: dependencies
 * }
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
    async constructStackblitzForm(exampleId: string, data: ExampleData, isTest: boolean): Promise<HTMLFormElement> {

        const liveExample = EXAMPLE_COMPONENTS[exampleId];
        const indexFile = `src%2Fapp%2F${data.indexFilename}`;
        const form = this.createFormElement(indexFile);
        const baseExamplePath =
            `${DOCS_CONTENT_PATH}/${liveExample.module.importSpecifier}/${exampleId}/`;

        TAGS.forEach((tag, i) => this.appendFormInput(form, `tags[${i}]`, tag));
        this.appendFormInput(form, 'private', 'true');
        this.appendFormInput(form, 'description', data.description);
        this.appendFormInput(form,
                             'dependencies',
                             JSON.stringify(isTest ? testDependencies : dependencies)
        );

        await this.ngZone.runOutsideAngular(() => {
            const fileReadPromises: Promise<void>[] = [];

            // Read all of the template files.
            (isTest ? TEST_TEMPLATE_FILES : TEMPLATE_FILES).forEach((file) => fileReadPromises.push(
                this.loadAndAppendFile(form, data, file, isTest ? TEST_TEMPLATE_PATH : TEMPLATE_PATH,
                                       isTest)));

            // Read the example-specific files.
            data.exampleFiles.forEach((file) => fileReadPromises.push(
                this.loadAndAppendFile(form, data, file, baseExamplePath, isTest)
            ));

            return Promise.all(fileReadPromises);
        });

        return form;
    }

    /** Constructs a new form element that will navigate to the stackblitz url. */
    createFormElement(indexFile: string): HTMLFormElement {
        const form = document.createElement('form');
        form.action = `${STACKBLITZ_URL}?file=${indexFile}`;
        form.method = 'post';
        form.target = '_blank';

        return form;
    }

    /** Appends the name and value as an input to the form. */
    appendFormInput(form: HTMLFormElement, name: string, value: string): void {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    /**
     * Reads the file and adds its text to the form
     * @param form the html form you are appending to
     * @param data example metadata about the example
     * @param filename file name of the example
     * @param path path to the src
     * @param prependApp whether to prepend the 'app' prefix to the path
     */
    readFile(form: HTMLFormElement,
             data: ExampleData,
             filename: string,
             path: string,
             prependApp = true): void {
        this.http.get(path + filename, {responseType: 'text'}).subscribe(
            (response) => this.addFileToForm(form, data, response, filename, path, prependApp),
            // tslint:disable-next-line:no-console
            (error) => console.log(error)
        );
    }

    /**
     * Adds the file text to the form.
     * @param form the html form you are appending to
     * @param data example metadata about the example
     * @param content file contents
     * @param filename file name of the example
     * @param path path to the src
     * @param prependApp whether to prepend the 'app' prefix to the path
     */
    addFileToForm(form: HTMLFormElement,
                  data: ExampleData,
                  content: string,
                  filename: string,
                  path: string,
                  isTest: boolean,
                  prependApp = true) {
        if (path === (isTest ? TEST_TEMPLATE_PATH : TEMPLATE_PATH)) {
            content = this.replaceExamplePlaceholderNames(data, filename, content);
        } else if (prependApp) {
            // tslint:disable-next-line:prefer-template
            filename = 'app/' + filename;
        }
        this.appendFormInput(form, `files[${filename}]`, this.appendCopyright(filename, content));
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
        if (fileName === 'index.html') {
            // Replace the component selector in `index,html`.
            // For example, <mosaic-docs-example></mosaic-docs-example> will be replaced as
            // <button-demo></button-demo>
            fileContent = fileContent
                .replace(/mosaic-docs-example/g, data.selectorName)
                .replace(/{{title}}/g, data.description)
                .replace(/{{version}}/g, mosaicVersion);
        } else if (fileName === 'main.ts') {
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

    appendCopyright(filename: string, content: string) {
        if (filename.indexOf('.ts') > -1 || filename.indexOf('.scss') > -1) {
            content = `${content}\n\n/**  ${COPYRIGHT} */`;
        } else if (filename.indexOf('.html') > -1) {
            content = `${content}\n\n<!-- ${COPYRIGHT} -->`;
        }

        return content;
    }

    private loadAndAppendFile(form: HTMLFormElement, data: ExampleData, filename: string,
                              path: string, isTest: boolean, prependApp = true): Promise<void> {
        const url = path + filename;
        let stream = this.fileCache.get(url);

        if (!stream) {
            stream = this.http.get(url, {responseType: 'text'}).pipe(shareReplay(1));
            this.fileCache.set(url, stream);
        }

        // The `take(1)` is necessary, because the Promise from `toPromise` resolves on complete.
        return stream.pipe(take(1)).toPromise().then(
            (response) => this.addFileToForm(form, data, response, filename, path, isTest, prependApp),
            // tslint:disable-next-line:no-console
            (error) => console.log(error)
        );
    }
}
