/* tslint:disable:no-parameter-reassignment */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExampleData } from '@ptsecurity/mosaic-examples';

import { mosaicVersion } from '../version/version';


const STACKBLITZ_URL = 'https://run.stackblitz.com/api/angular/v1';

const COPYRIGHT =
    `Copyright 2019 Positive Technologies. All Rights Reserved.
    Use of this source code is governed by an MIT-style license.`;

/**
 * Path that refers to the docs-content from the "@ptsecurity/mosaic-examples" package. The
 * structure is defined in the repository, but we include the docs-content as assets in
 * in the CLI configuration.
 */
const DOCS_CONTENT_PATH = 'docs-content/examples-source/';

const TEMPLATE_PATH = 'assets/stackblitz/';
const TEMPLATE_FILES = [
    'index.html',
    'styles.css',
    'polyfills.ts',
    '.angular-cli.json',
    'main.ts',
    'mosaic-module.ts'
];

const TAGS: string[] = ['angular', 'mosaic', 'example'];
const angularVersion = '>=8.0.0';

const dependencies = {
    '@ptsecurity/cdk': mosaicVersion,
    '@ptsecurity/mosaic': mosaicVersion,
    '@ptsecurity/mosaic-icons': '~3.1.0',
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
    'core-js': '^2.4.1',
    rxjs: '^6.4.0',
    'web-animations-js': '^2.3.1',
    messageformat: '^2.0.5',
    'zone.js': '^0.8.14',
    moment: '^2.24.0'
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
@Injectable()
export class StackblitzWriter {
    constructor(private _http: HttpClient) {
    }

    /**
     * Returns an HTMLFormElement that will open a new stackblitz template with the example data when
     * called with submit().
     */
    constructStackblitzForm(data: ExampleData): Promise<HTMLFormElement> {
        const indexFile = `app%2F${data.indexFilename}.ts`;
        const form = this.createFormElement(indexFile);

        TAGS.forEach((tag, i) => this.appendFormInput(form, `tags[${i}]`, tag));
        this.appendFormInput(form, 'private', 'true');
        this.appendFormInput(form, 'description', data.description);
        this.appendFormInput(form, 'dependencies', JSON.stringify(dependencies));

        return new Promise((resolve) => {
            const templateContents = TEMPLATE_FILES
                .map((file) => this.readFile(form, data, file, TEMPLATE_PATH));

            const exampleContents = data.exampleFiles
                .map((file) => this.readFile(form, data, file, DOCS_CONTENT_PATH));

            // TODO: Prevent including assets to be manually checked.
            if (data.selectorName === 'icon-svg-example') {
                this.readFile(form, data, 'assets/img/examples/thumbup-icon.svg', '', false);
            }

            Promise.all(templateContents.concat(exampleContents)).then(() => {
                resolve(form);
            });
        });
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
        this._http.get(path + filename, {responseType: 'text'}).subscribe(
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
                  prependApp = true) {
        if (path === TEMPLATE_PATH) {
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
            fileContent = fileContent.replace(/mosaic-docs-example/g, data.selectorName);
            fileContent = fileContent.replace(/{{version}}/g, mosaicVersion);
        } else if (fileName === 'main.ts') {
            // Replace the component name in `main.ts`.
            // Replace `import {MosaicDocsExample} from 'mosaic-docs-example'`
            // will be replaced as `import {ButtonDemo} from './button-demo'`
            fileContent = fileContent.replace(/{ MosaicDocsExample }/g, `{ ${data.componentName} }`);

            // Replace `declarations: [MosaicDocsExample]`
            // will be replaced as `declarations: [ButtonDemo]`
            fileContent = fileContent.replace(/declarations: \[MosaicDocsExample\]/g,
                `declarations: [${data.componentName}]`);

            // Replace `entryComponents: [MosaicDocsExample]`
            // will be replaced as `entryComponents: [DialogContent]`
            fileContent = fileContent.replace(/entryComponents: \[MosaicDocsExample\]/g,
                `entryComponents: [${data.componentName}]`);

            // Replace `bootstrap: [MosaicDocsExample]`
            // will be replaced as `bootstrap: [ButtonDemo]`
            // This assumes the first component listed in the main component
            const componentList = (data.componentName || '').split(',')[0];
            fileContent = fileContent.replace(/bootstrap: \[MosaicDocsExample\]/g,
                `bootstrap: [${componentList}]`);

            fileContent = fileContent.replace(/mosaic-docs-example/g, data.indexFilename);
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
}
