import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';


interface Link {
    /* id of the section*/
    id: string;

    /* header type h3/h4 */
    type: string;

    /* If the anchor is in view of the page */
    active: boolean;

    /* name of the anchor */
    name: string;

    /* top offset px of the anchor */
    top: number;
}

@Component({
    selector: 'table-of-contents',
    styleUrls: ['./table-of-contents.scss'],
    templateUrl: './table-of-contents.html'
})
export class TableOfContents {

    @Input() links: Link[] = [];
    @Input() headerSelectors = '.docs-markdown h3, .docs-markdown h4';

    constructor(
        @Inject(DOCUMENT) private _document: Document
    ) {
        this.links = this.createLinks();
    }


    private createLinks(): Link[] {

        const links = [];
        const headers =
            Array.from(this._document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        if (headers.length) {
            for (const header of headers) {
                const name = header.innerText.trim().replace(/^link/, '');
                const {top} = header.getBoundingClientRect();
                links.push({
                    name,
                    type: header.tagName.toLowerCase(),
                    top: top,
                    id: header.id,
                    active: false
                });
            }
        }

        return links;
    }
}
