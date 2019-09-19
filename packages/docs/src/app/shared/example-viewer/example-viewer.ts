import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { EXAMPLE_COMPONENTS, LiveExample } from '@ptsecurity/mosaic-examples';
import { McTooltip } from '@ptsecurity/mosaic/tooltip';

import { CopierService } from '../copier/copier.service';


/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

@Component({
    selector: 'example-viewer',
    templateUrl: './example-viewer.html',
    styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer {
    elementRef: ElementRef;
    /** Component portal for the currently displayed example. */
    selectedPortal: ComponentPortal<any>;

    /** Map of example files that should be displayed in the view-source tab. */
    exampleTabs: { [tabName: string]: string };

    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Whether the source for the example is being displayed. */
    showSource = false;
    shadowHide = 'hljs-shadow_hidden';
    numbers = '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n';
    mcTooltipDelay = 3000;
    /** String key of the currently displayed example. */
    @Input()
    get example() {
        return this._example;
    }

    set example(exampleName: string) {
        if (exampleName && EXAMPLE_COMPONENTS[exampleName]) {
            this._example = exampleName;
            this.exampleData = EXAMPLE_COMPONENTS[exampleName];
            this.selectedPortal = new ComponentPortal(this.exampleData.component);
            this.generateExampleTabs();
        } else {
            // tslint:disable-next-line:no-console
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string;

    @ViewChild('tooltip', { static: false }) tooltip: McTooltip;
    constructor(private copier: CopierService,
                @Inject(ElementRef) elementRef: ElementRef) {
        this.elementRef = elementRef;
    }

    setNumbers() {
        const exampleSource = this.elementRef.nativeElement.querySelector('.docs-example-source-viewer');
        const length = exampleSource.textContent.match(/\n/g).length + 1;
        this.numbers = '';
        for (let i = 1; i <= length; i++) {
            this.numbers += `${i}\n`;
        }
    }

    toggleSourceView(): void {
        this.showSource = !this.showSource;
    }

    getExampleTabNames() {
        return Object.keys(this.exampleTabs);
    }

    copyCode(event): void {
        const code = event.target.parentNode.parentNode;
        // event.target.parentNode.parentNode.select();
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();

        this.tooltip.show();
        setTimeout(() => {
            this.tooltip.hide();
        }, this.mcTooltipDelay);
    }

    private resolveHighlightedExampleFile(fileName: string) {
        return `docs-content/examples-highlighted/${fileName}`;
    }

    private generateExampleTabs() {
        this.exampleTabs = {
            HTML: this.resolveHighlightedExampleFile(`${this.example}-example-html.html`),
            TS: this.resolveHighlightedExampleFile(`${this.example}-example-ts.html`),
            CSS: this.resolveHighlightedExampleFile(`${this.example}-example-css.html`)
        };

        const additionalFiles = this.exampleData.additionalFiles || [];

        additionalFiles.forEach((fileName) => {
            // Since the additional files refer to the original file name, we need to transform
            // the file name to match the highlighted HTML file that displays the source.
            const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
            this.exampleTabs[fileName] = this.resolveHighlightedExampleFile(fileSourceName);
        });
    }
}
