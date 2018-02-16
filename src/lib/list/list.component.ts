import {
    ChangeDetectionStrategy,
    Component, Directive, ElementRef, OnDestroy, ViewEncapsulation
} from '@angular/core';

import { mixinColor, mixinDisabled, CanColor, CanDisable } from '../core/common-behaviors/index';
import { FocusMonitor } from '../../cdk/a11y';
import { Platform } from '../../cdk/platform';


@Directive({
    selector: '[mc-list]',
    host: { class: 'mc-list' }
})
export class McListCSSStyler {}


export class McListBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McListMixinBase = mixinColor(mixinDisabled(McListBase));


@Component({
    selector: '[mc-list]',
    templateUrl: './list.component.html',
    styleUrls: ['./list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[disabled]': 'disabled || null',
    }
})
export class McList extends _McListMixinBase implements OnDestroy, CanDisable, CanColor {
    constructor(elementRef: ElementRef, private _platform: Platform, private _focusMonitor: FocusMonitor) {
        super(elementRef);

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this._getHostElement().focus();
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }
}
