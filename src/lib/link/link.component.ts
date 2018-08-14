import { Directive, ElementRef, OnDestroy } from '@angular/core';

import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { Platform } from '@ptsecurity/cdk/platform';


@Directive({
    selector: `.mc-link`
})

export class McLink implements OnDestroy {
    constructor(private elementRef: ElementRef, private _platform: Platform, private _focusMonitor: FocusMonitor) {

        this._focusMonitor.monitor(elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this._getHostElement().focus();
    }

    _getHostElement() {
        return this.elementRef.nativeElement;
    }
}
