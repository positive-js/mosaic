import {
    ChangeDetectionStrategy,
    Component, Directive, ElementRef, OnDestroy, ViewEncapsulation
} from '@angular/core';

import { mixinColor, mixinDisabled, CanColor, CanDisable } from '../core/common-behaviors/index';
import { FocusMonitor } from '../../cdk/a11y';


@Directive({
    selector: 'button[mc-button], a[mc-button]',
    host: { class: 'mc-button' }
})
export class McButtonCSSStyler {}

export class McButtonBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McButtonMixinBase = mixinColor(mixinDisabled(McButtonBase));

@Component({
    selector: 'button[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[disabled]': 'disabled || null',
    }
})
export class McButton extends _McButtonMixinBase implements OnDestroy, CanDisable, CanColor {
    constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
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
