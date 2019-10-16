import {
    Input,
    ElementRef,
    OnDestroy,
    ChangeDetectorRef,
    Directive,
    Attribute
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
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

export const mcLinkBase: HasTabIndexCtor & CanDisableCtor & typeof McLinkBase
    = mixinTabIndex(mixinDisabled(McLinkBase));

@Directive({
    selector: 'a.mc-link',
    exportAs: 'mcLink',
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex'
    }
})

export class McLink extends mcLinkBase implements OnDestroy, HasTabIndex, CanDisable {

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
        private changeDetector: ChangeDetectorRef,
        @Attribute('tabindex') tabIndex: string
    ) {
        super(elementRef);

        this.tabIndex = parseInt(tabIndex) || 0;

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
