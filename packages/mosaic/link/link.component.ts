import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Input,
    ElementRef,
    OnDestroy,
    ChangeDetectorRef,
    Directive
} from '@angular/core';
import {
    CanDisable, CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';


export class McLinkBase {
    constructor(public elementRef: ElementRef) {}
}

// tslint:disable-next-line: naming-convention
export const McLinkMixinBase: HasTabIndexCtor & CanDisableCtor &
    typeof McLinkBase = mixinTabIndex(mixinDisabled(McLinkBase));

@Directive({
    selector: 'a.mc-link',
    exportAs: 'mcLink',
    inputs: ['tabIndex'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex'
    }
})

export class McLink extends McLinkMixinBase implements OnDestroy, HasTabIndex, CanDisable {
    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    constructor(
        elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        private changeDetector: ChangeDetectorRef
    ) {
        super(elementRef);

        this.focusMonitor.monitor(elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.getHostElement().focus();
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }
}
