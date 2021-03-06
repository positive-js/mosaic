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

export const baseURLRegex = /^http(s)?:\/\//;

@Directive({
    selector: '[mc-link]',
    exportAs: 'mcLink',
    inputs: ['tabIndex'],
    host: {
        class: 'mc-link',
        '[class.mc-link_no-underline]': 'noUnderline',
        '[class.mc-link_use-visited]': 'useVisited',
        '[class.mc-link_pseudo]': 'pseudo',
        '[class.mc-link_print]': 'printMode',
        '[class.mc-text-only]': '!hasIcon',
        '[class.mc-text-with-icon]': 'hasIcon',
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '[attr.print]': 'print'
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
    get noUnderline() {
        return this._noUnderline;
    }

    set noUnderline(value: any) {
        this._noUnderline = toBoolean(value);
    }

    private _noUnderline = false;

    @Input()
    get useVisited() {
        return this._useVisited;
    }

    set useVisited(value: any) {
        this._useVisited = toBoolean(value);
    }

    private _useVisited = false;

    get hasIcon(): boolean {
        return !!this.icon;
    }

    @Input()
    get print() {
        return this._print || this.getHostElement().href?.replace(baseURLRegex, '');
    }

    set print(value: any) {
        this.printMode = toBoolean(value);

        this._print = value;
    }

    private _print: string;

    printMode: boolean;

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
