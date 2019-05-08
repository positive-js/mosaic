import { EventEmitter, Inject, Injectable, Optional, OnDestroy } from '@angular/core';

import { DIR_DOCUMENT } from './dir-document-token';


export type Direction = 'ltr' | 'rtl';


/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
@Injectable({providedIn: 'root'})
export class Directionality implements OnDestroy {
    /** The current 'ltr' or 'rtl' value. */
    readonly value: Direction = 'ltr';

    /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
    readonly change = new EventEmitter<Direction>();

    constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
        if (_document) {
            const bodyDir = _document.body ? _document.body.dir : null;
            const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
            const value = bodyDir || htmlDir;
            this.value = (value === 'ltr' || value === 'rtl') ? value : 'ltr';
        }
    }

    ngOnDestroy() {
        this.change.complete();
    }
}
