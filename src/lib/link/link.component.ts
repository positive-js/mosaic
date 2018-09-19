import {
    Input,
    Attribute,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import {
    CanDisable,
    HasTabIndex,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';


export class McLinkBase {
    constructor(public _elementRef: ElementRef) {
    }
}

export const _McLinkBase = mixinTabIndex(mixinDisabled(McLinkBase));

@Component({
    selector: 'a.mc-link',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'mcLink',
    styleUrls: ['./link.css'],
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex'
    }
})

export class McLink extends _McLinkBase implements OnDestroy, HasTabIndex, CanDisable {

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this._changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    constructor(
        @Attribute('tabindex') tabIndex: string,
        public elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _changeDetector: ChangeDetectorRef) {

        super(elementRef);
        this._focusMonitor.monitor(elementRef.nativeElement, true);
        this.tabIndex = parseInt(tabIndex) || 0;
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
