import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
import { ENTER, SPACE } from '@ptsecurity/cdk/keycodes';
import { McButton, McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { toBoolean } from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { merge, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { McVerticalNavbar } from './vertical-navbar.component';


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
    selector: 'mc-navbar-item, [mc-navbar-item], mc-navbar-brand, [mc-navbar-brand], mc-navbar-toggle',
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        class: 'mc-navbar-focusable-item',
        '[class.mc-navbar-item_button]': 'button',
        '[class.mc-focused]': 'hasFocus',

        '(focus)': 'focus()',
        '(blur)': 'blur()'
    }
})
export class McNavbarFocusableItem implements IFocusableOption {
    @ContentChild(McButton) button: McButton;

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
        return -1;
    }

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
        console.log('ngAfterContentInit: ');

        if (this.button) {
            this.button.tabIndex = -1;
        }

        this.focusMonitor
            .monitor(this.elementRef, true);
            // .subscribe(this.focus);
    }

    focus = () => {
        if (this.disabled || this.hasFocus || this.button?.hasFocus) { return; }
        console.log('focus: ', origin);

        if (this.button) {
            this.hasFocus = true;

            this.button.focusViaKeyboard();

            this.changeDetector.markForCheck();

            return;
        }

        this.elementRef.nativeElement.focus();

        this.onFocus.next({ item: this });

        Promise.resolve().then(() => {
            this.hasFocus = true;

            this.changeDetector.markForCheck();
        });
    }

    blur(): void {
        console.log('blur(): ');
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

                    if (this.button?.hasFocus) { return; }

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
        '[class.mc-navbar-item_bento]': 'bento',
        '[class.mc-navbar-item_collapsed]': 'collapsed',

        '[attr.title]': 'collapsedTitle',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem {
    @ContentChild(McNavbarTitle) title: McNavbarTitle;
    @ContentChild(McIcon) icon: McIcon;

    @Input() bento: boolean = false;

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

    constructor(@Optional() private dropdownTrigger: McDropdownTrigger) {
        if (this.dropdownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

    onKeyDown($event: KeyboardEvent) {
        if (this.dropdownTrigger && [ENTER, SPACE].includes($event.keyCode)) {
            this.dropdownTrigger.open();

            $event.preventDefault();
        }
    }
}


@Component({
    selector: 'mc-navbar-toggle',
    template: `
        <i mc-icon
           [class.mc-angle-left-M_16]="navbar.expanded"
           [class.mc-angle-right-M_16]="!navbar.expanded"
           *ngIf="!customIcon">
        </i>

        <ng-content select="[mc-icon]"></ng-content>
        <ng-content select="mc-navbar-title" *ngIf="navbar.expanded"></ng-content>
    `,
    styleUrls: ['./navbar.scss'],
    host: {
        class: 'mc-navbar-item mc-navbar-toggle mc-vertical',
        '(keydown)': 'onKeydown($event)',
        '(click)': 'navbar.toggle()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarToggle {
    @ContentChild(McIcon) customIcon: McIcon;

    constructor(public navbar: McVerticalNavbar) {}

    onKeydown($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.navbar.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }
}
