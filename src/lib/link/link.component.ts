import { Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';

import { FocusMonitor } from '@ptsecurity/cdk/a11y';


@Component({
    selector: 'a.mc-link',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./link.css'],
    inputs: ['disabled', 'tabindex'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'disabled ? -1 : tabindex ? tabindex : 0'
    }
})

export class McLink implements OnDestroy {
    constructor(private elementRef: ElementRef, private _focusMonitor: FocusMonitor) {

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
