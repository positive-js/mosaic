import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Input,
    ElementRef,
    OnDestroy,
    ChangeDetectorRef,
    Directive,
    ContentChild
} from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';


export class McLinkBase {}

// tslint:disable-next-line: naming-convention
export const McLinkMixinBase: HasTabIndexCtor & CanDisableCtor &
    typeof McLinkBase = mixinTabIndex(mixinDisabled(McLinkBase));

@Directive({
    selector: '[mc-link]',
    exportAs: 'mcLink',
    inputs: ['tabIndex'],
    host: {
        class: 'mc-link',
        '[class.mc-link_underlined]': 'underlined',
        '[class.mc-link_pseudo]': 'pseudo',
        '[class.mc-text-only]': '!hasIcon',
        '[class.mc-text-with-icon]': 'hasIcon',
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

    @Input()
    get pseudo() {
        return this._pseudo;
    }

    set pseudo(value: any) {
        this._pseudo = toBoolean(value);
    }

    private _pseudo = false;

    @Input()
    get underlined() {
        return this._underlined;
    }

    set underlined(value: any) {
        this._underlined = toBoolean(value);
    }

    private _underlined = false;

    get hasIcon(): boolean {
        return !!this.icon;
    }

    @ContentChild(McIcon) icon: McIcon;

    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        private changeDetector: ChangeDetectorRef
    ) {
        super();

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
