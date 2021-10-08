import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


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
export class McNavbarItemBase {
    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    vertical: boolean;
    horizontal: boolean;

    closed: boolean;

    constructor(public elementRef: ElementRef) {}

    getOuterElementWidth(): number {
        const { width, marginLeft, marginRight } = window.getComputedStyle(this.elementRef.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}

// tslint:disable-next-line:naming-convention
export const McNavbarMixinBase: CanDisableCtor & typeof McNavbarItemBase = mixinDisabled(McNavbarItemBase);


@Component({
    selector: 'mc-navbar-item, [mc-navbar-item]',
    exportAs: 'mcNavbarItem',
    template: `<ng-content></ng-content>`,
    host: {
        class: 'mc-navbar-item',
        '[class.mc-navbar-item_collapsed]': 'collapsed',
        '[class.mc-navbar-item_button]': 'button',

        '[attr.title]': 'collapsedTitle',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    },
    inputs: ['disabled'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem extends McNavbarMixinBase implements OnDestroy, CanDisable, AfterContentInit {
    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;
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

    get tabIndex(): number {
        return this.disabled || this.button ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value != null ? coerceNumberProperty(value) : 0;
    }

    private _tabIndex: number = 0;

    constructor(private focusMonitor: FocusMonitor, public elementRef: ElementRef) {
        super(elementRef);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    ngAfterContentInit(): void {
        if (this.button) { return; }

        this.focusMonitor.monitor(this.elementRef, true);
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }
}
