import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class McMeasureScrollbarService {

    get scrollBarWidth(): number {
        if (this._scrollbarWidth) {
            return this._scrollbarWidth;
        }
        this.initScrollBarWidth();

        return this._scrollbarWidth;
    }

    private _scrollbarWidth: number;
    private scrollbarMeasure = {
        position: 'absolute',
        top: '-9999px',
        width: '50px',
        height: '50px',
        overflow: 'scroll'
    };

    constructor(
        @Inject(DOCUMENT) private document: any
    ) {
        this.initScrollBarWidth();
    }

    initScrollBarWidth() {
        const scrollDiv = this.document.createElement('div');

        for (const scrollProp in this.scrollbarMeasure) {
            if (this.scrollbarMeasure.hasOwnProperty(scrollProp)) {
                scrollDiv.style[scrollProp] = this.scrollbarMeasure[scrollProp];
            }
        }

        this.document.body.appendChild(scrollDiv);

        const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        this.document.body.removeChild(scrollDiv);
        this._scrollbarWidth = width;
    }
}
