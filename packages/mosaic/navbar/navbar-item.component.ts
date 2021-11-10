import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { toBoolean } from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { merge, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';


// tslint:disable-next-line:naming-convention
export interface McNavbarFocusableItemEvent {
    item: McNavbarFocusableItem;
}


@Directive({
    selector: 'mc-navbar-logo, [mc-navbar-logo]',
    host: {
        class: 'mc-navbar-logo',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class McNavbarLogo {
    readonly hovered = new Subject<boolean>();
}


@Directive({
    selector: 'mc-navbar-title, [mc-navbar-title]',
    host: {
        class: 'mc-navbar-title',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class McNavbarTitle implements AfterContentInit {
    readonly hovered = new Subject<boolean>();

    outerElementWidth: number;

    get text(): string {
        return this.elementRef.nativeElement.innerText;
    }

    constructor(private elementRef: ElementRef) {}

    getOuterElementWidth(): number {
        const { width, marginLeft, marginRight } = window.getComputedStyle(this.elementRef.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item) || 0, 0);
    }

    ngAfterContentInit(): void {
        this.outerElementWidth = this.getOuterElementWidth();
    }
}


@Directive({
    selector: 'mc-navbar-brand, [mc-navbar-brand]',
    host: {
        class: 'mc-navbar-brand',
        '[class.mc-hovered]': 'hovered'
    }
})
export class McNavbarBrand implements AfterContentInit, OnDestroy {
    @ContentChild(McNavbarLogo) logo: McNavbarLogo;
    @ContentChild(McNavbarTitle) title: McNavbarTitle;

    hovered = false;

    private destroyed = new Subject<void>();

    ngAfterContentInit(): void {
        merge(
            this.logo.hovered,
            this.title.hovered
        )
        .pipe(takeUntil(this.destroyed))
        .subscribe((value: boolean) => this.hovered = value);
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }
}


@Directive({
    selector: 'mc-navbar-divider',
    host: {
        class: 'mc-navbar-divider'
    }
})
export class McNavbarDivider {}

@Directive({
    selector: 'mc-navbar-item, [mc-navbar-item], mc-navbar-divider, mc-navbar-brand, [mc-navbar-brand]',
    host: {
        '[class.mc-vertical]': 'vertical',
        '[class.mc-horizontal]': 'horizontal',

        '[class.mc-opened]': 'vertical && !closed',
        '[class.mc-closed]': 'vertical && closed'
    }
})
export class McNavbarRectangleElement {
    vertical: boolean;
    horizontal: boolean;

    closed: boolean;

    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    constructor(public elementRef: ElementRef) {}

    getOuterElementWidth(): number {
        const { width, marginLeft, marginRight } = window.getComputedStyle(this.elementRef.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}

@Directive({
    selector: 'mc-navbar-item, [mc-navbar-item], mc-navbar-brand, [mc-navbar-brand]',
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        '[class.mc-navbar-item_button]': 'button',
        '[class.mc-focused]': 'hasFocus',

        '(focusin)': 'focus()',
        '(blur)': 'blur()'
    }
})
export class McNavbarFocusableItem implements IFocusableOption {
    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    readonly onFocus = new Subject<McNavbarFocusableItemEvent>();

    readonly onBlur = new Subject<McNavbarFocusableItemEvent>();

    hasFocus: boolean = false;

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

    get tabIndex(): number {
        return this.disabled || this.button ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value != null ? coerceNumberProperty(value) : 0;
    }

    private _tabIndex: number = 0;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetector: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private ngZone: NgZone
    ) {}

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    ngAfterContentInit(): void {
        if (this.button) { return; }

        this.focusMonitor.monitor(this.elementRef, true);
    }

    focus(origin?: FocusOrigin, options?: FocusOptions) {
        if (this.disabled || this.hasFocus) { return; }

        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(this.elementRef.nativeElement, origin, options);
        } else {
            this.elementRef.nativeElement.focus();
        }

        this.onFocus.next({ item: this });

        Promise.resolve().then(() => {
            this.hasFocus = true;

            this.changeDetector.markForCheck();
        });
    }

    blur(): void {
        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.hasFocus = false;

                    this.onBlur.next({ item: this });
                });
            });
    }
}

@Component({
    selector: 'mc-navbar-item, [mc-navbar-item]',
    exportAs: 'mcNavbarItem',
    template: `<ng-content></ng-content>`,
    host: {
        class: 'mc-navbar-item',
        '[class.mc-navbar-item_collapsed]': 'collapsed',

        '[attr.title]': 'collapsedTitle',
        '(keydown)': 'onKeydown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem {
    @ContentChild(McNavbarTitle) title: McNavbarTitle;
    @ContentChild(McIcon) icon: McIcon;

    @Input()
    get collapsable(): boolean {
        return this._collapsable;
    }

    set collapsable(value: boolean) {
        this._collapsable = coerceBooleanProperty(value);
    }

    private _collapsable: boolean = true;

    @Input() collapsed = false;

    get collapsedTitle(): string | null {
        return this.collapsed ? (this._collapsedTitle || this.title.text) : null;
    }

    @Input()
    set collapsedTitle(value: string | null) {
        this._collapsedTitle = value;
    }

    private _collapsedTitle: string | null = null;

    constructor(@Optional() private dropdownTrigger: McDropdownTrigger) {}

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

    onKeydown($event: KeyboardEvent) {
        if (!this.dropdownTrigger) { return; }

        console.log('onKeydown: ', $event);

        if (this.dropdownTrigger) {
            console.log('this.dropdownTrigger: ', this.dropdownTrigger);
        }
    }
}
