/* tslint:disable:prefer-template no-string-literal */
import { Component, ElementRef, Input, NgModuleFactory, Type, ɵNgModuleFactory } from '@angular/core';
import { EXAMPLE_COMPONENTS, LiveExample } from '@ptsecurity/mosaic-examples';

import { CopierService } from '../copier/copier.service';


/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

/** Preferred order for files of an example displayed in the viewer. */
const preferredExampleFileOrder = ['HTML', 'TS', 'CSS'];

@Component({
    selector: 'example-viewer',
    templateUrl: './example-viewer.html',
    styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer {

    /** Map of example files that should be displayed in the view-source tab. */
    exampleTabs: { [tabName: string]: string };

    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Component type for the current example. */
    exampleComponentType: Type<any> | null = null;

    /** Module factory that declares the example component. */
    exampleModuleFactory: NgModuleFactory<any> | null = null;

    /** Whether the source for the example is being displayed. */
    isSourceShown = false;
    isSwitcherHidden = false;
    shadowHide = 'hljs-shadow_hidden';
    maxEditorLength = 15;
    lineNumbers = '';
    codeCopyDelay = 1000;

    codeCopySuccessClass: string = 'docs-example-source-copy_success';

    /** String key of the currently displayed example. */
    @Input()
    get example() {
        return this._example;
    }

    set example(exampleName: string | null) {
        if (exampleName && exampleName !== this._example && EXAMPLE_COMPONENTS[exampleName]) {
            this._example = exampleName;
            this.exampleData = EXAMPLE_COMPONENTS[exampleName];
            this.generateExampleTabs();
            this.loadExampleComponent().catch((error) =>
                // tslint:disable-next-line:no-console
                console.error(`Could not load example '${exampleName}': ${error}`));
        } else {
            // tslint:disable-next-line:no-console
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string | null;

    constructor(public copier: CopierService,
                private readonly elementRef: ElementRef<HTMLElement>) {
        this.elementRef = elementRef;
    }

    ngAfterContentChecked() {
        if (!this.lineNumbers) { this.setLineNumbers(); }
    }

    setLineNumbers() {
        const exampleSource = this.elementRef
            .nativeElement.querySelector('.mc-tab-body__active .docs-example-source-viewer');

        if (exampleSource) {
            const text = exampleSource.textContent!.match(/\n/g);
            const length = text ? text.length + 1 : 0;
            this.lineNumbers = '';
            for (let i = 1; i <= length; i++) {
                this.lineNumbers += `${i}\n`;
            }
            this.isSwitcherHidden = length < this.maxEditorLength;
        }
    }

    toggleSourceView(): void {
        this.isSourceShown = !this.isSourceShown;
    }

    getExampleTabNames() {
        return this.exampleTabs ? Object.keys(this.exampleTabs).sort((a, b) => {
            let indexA = preferredExampleFileOrder.indexOf(a);
            let indexB = preferredExampleFileOrder.indexOf(b);
            // Files which are not part of the preferred example file order should be
            // moved after all items with a preferred index.
            if (indexA === -1) {
                indexA = preferredExampleFileOrder.length;
            }

            if (indexB === -1) {
                indexB = preferredExampleFileOrder.length;
            }

            return (indexA - indexB) || 1;
        }) : [];
    }

    copyCode(event): void {
        const code = this.elementRef.nativeElement.querySelector('.docs-example-source-viewer');
        // event.target.parentNode.parentNode.select();

        if (!code) { return; }

        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();

        if (!sel) { return; }

        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        event.target.parentNode.classList.add(this.codeCopySuccessClass);
        setTimeout(
            () => event.target.parentNode.classList.remove(this.codeCopySuccessClass), this.codeCopyDelay
        );
    }

    private async loadExampleComponent() {
        if (this._example != null) {
            const {componentName, module} = EXAMPLE_COMPONENTS[this._example];
            // Lazily loads the example package that contains the requested example. Webpack needs to be
            // able to statically determine possible imports for proper chunk generation. Explicitly
            // specifying the path to the `fesm2015` folder as first segment instructs Webpack to generate
            // chunks for each example flat esm2015 bundle. To avoid generating unnecessary chunks for
            // source maps (which would never be loaded), we instruct Webpack to exclude source map
            // files. More details: https://webpack.js.org/api/module-methods/#magic-comments.
            // module.importSpecifier
            // @ts-ignore
            const moduleExports: any = await import(
                /* webpackExclude: /\.map$/ */
            `@ptsecurity/mosaic-examples/fesm2020/${module.importPath}`);
            this.exampleComponentType = moduleExports[componentName];
            // The components examples package is built with Ivy. This means that no factory files are
            // generated. To retrieve the factory of the AOT compiled module, we simply pass the module
            // class symbol to Ivy's module factory constructor. There is no equivalent for View Engine,
            // where factories are stored in separate files. Hence the API is currently Ivy-only.
            this.exampleModuleFactory = new ɵNgModuleFactory(moduleExports[module.name]);

            // Since the data is loaded asynchronously, we can't count on the native behavior
            // that scrolls the element into view automatically. We do it ourselves while giving
            // the page some time to render.
            // tslint:disable-next-line:no-typeof-undefined
            if (typeof location !== 'undefined' && location.hash.slice(1) === this._example) {
                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => this.elementRef.nativeElement.scrollIntoView(), 300);
            }
        }
    }

    private generateExampleTabs() {

        this.exampleTabs = {};

        if (this.exampleData) {
            const exampleBaseFileName = `${this.example}-example`;
            const docsContentPath = `docs-content/examples-highlighted/${this.exampleData.packagePath}`;

            for (const fileName of this.exampleData.files) {
                // Since the additional files refer to the original file name, we need to transform
                // the file name to match the highlighted HTML file that displays the source.
                const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
                const importPath = `${docsContentPath}/${fileSourceName}`;

                if (fileName === `${exampleBaseFileName}.ts`) {
                    this.exampleTabs['TS'] = importPath;
                } else if (fileName === `${exampleBaseFileName}.css`) {
                    this.exampleTabs['CSS'] = importPath;
                } else if (fileName === `${exampleBaseFileName}.html`) {
                    this.exampleTabs['HTML'] = importPath;
                } else {
                    this.exampleTabs[fileName] = importPath;
                }
            }
        }
    }
}
