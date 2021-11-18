import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { ENTER, NUMPAD_DIVIDE, SPACE } from '@ptsecurity/cdk/keycodes';
import { McButton, McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { PopUpPlacements, toBoolean } from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { MC_TOOLTIP_SCROLL_STRATEGY, McTooltipTrigger, TooltipModifier } from '@ptsecurity/mosaic/tooltip';
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

    get isOverflown() {
        return this.elementRef.nativeElement.scrollWidth > this.elementRef.nativeElement.clientWidth;
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
    selector: 'mc-navbar-subtitle, [mc-navbar-subtitle]',
    host: {
        class: 'mc-navbar-subtitle',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class McNavbarSubTitle implements AfterContentInit {
    readonly hovered = new Subject<boolean>();

    outerElementWidth: number;

    get text(): string {
        return this.elementRef.nativeElement.innerText;
    }

    get isOverflown() {
        return this.elementRef.nativeElement.scrollWidth > this.elementRef.nativeElement.clientWidth;
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


@Component({
    selector: 'mc-navbar-brand, [mc-navbar-brand]',
    exportAs: 'mcNavbarBrand',
    template: `
        <ng-content></ng-content>
        <div class="mc-navbar-item__overlay"></div>
    `,
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
    templateUrl: './navbar-item.component.html',
    host: {
        class: 'mc-navbar-item',
        '[class.mc-navbar-item_bento]': 'bento',
        '[class.mc-navbar-item_collapsed]': 'collapsed',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem extends McTooltipTrigger {
    @ContentChild(McNavbarTitle) title: McNavbarTitle;
    @ContentChild(McNavbarSubTitle) subTitle: McNavbarSubTitle;

    @ContentChild(McIcon) icon: McIcon;

    @Input() bento: boolean = false;

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        this._collapsed = value;
    }

    private _collapsed = false;

    get croppedText(): string {
        const croppedTitleText = this.title?.isOverflown ? this.titleText : '';
        const croppedSubTitleText = this.subTitle?.isOverflown ? this.subTitleText : '';

        return `${croppedTitleText}\n ${croppedSubTitleText}`;
    }

    @Input()
    get collapsable(): boolean {
        return this._collapsable;
    }

    set collapsable(value: boolean) {
        this._collapsable = coerceBooleanProperty(value);
    }

    private _collapsable: boolean = true;

    get titleText(): string | null {
        return this.title?.text || null;
    }

    get subTitleText(): string | null {
        return this.subTitle?.text || null;
    }

    get disabled(): boolean {
        return (!this.collapsed && !this.hasCroppedText) || !this.title;
    }

    get hasDropDownTrigger(): boolean {
        return !!this.dropdownTrigger;
    }

    get showVerticalDropDownAngle(): boolean {
        return !this.bento && this.hasDropDownTrigger && this.rectangleElement.vertical && !this.collapsed;
    }

    get showHorizontalDropDownAngle(): boolean {
        return this.hasDropDownTrigger && this.rectangleElement.horizontal && !this.collapsed ;
    }

    get hasCroppedText(): boolean {
        return !!(this.title?.isOverflown || this.subTitle?.isOverflown);
    }

    constructor(
        public rectangleElement: McNavbarRectangleElement,
        private changeDetectorRef: ChangeDetectorRef,
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        @Optional() private dropdownTrigger: McDropdownTrigger
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

        if (this.hasDropDownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }

        this.placement = PopUpPlacements.Right;

        this.rectangleElement.navbarItem = this;
    }

    ngAfterContentInit(): void {
        this.updateTooltip();
    }

    updateTooltip(): void {
        if (this.collapsed) {
            this.content = `${this.titleText}\n ${this.subTitleText || ''}`;
        } else if (!this.collapsed && this.hasCroppedText) {
            this.content = this.croppedText;
        }

        console.log('this.changeDetectorRef.markForCheck(): ');
        this.changeDetectorRef.markForCheck();
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

    onKeyDown($event: KeyboardEvent) {
        if (this.hasDropDownTrigger && [ENTER, SPACE].includes($event.keyCode)) {
            this.dropdownTrigger.open();

            $event.preventDefault();
        }
    }
}


@Directive({
    selector: 'mc-navbar-item, [mc-navbar-item], mc-navbar-divider, mc-navbar-brand, [mc-navbar-brand]',
    host: {
        '[class.mc-vertical]': 'vertical',
        '[class.mc-horizontal]': 'horizontal',

        '[class.mc-expanded]': 'vertical && !collapsed',
        '[class.mc-collapsed]': 'vertical && collapsed'
    }
})
export class McNavbarRectangleElement {
    navbarItem: McNavbarItem;

    vertical: boolean;
    horizontal: boolean;

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        this._collapsed = value;

        if (this.navbarItem) {
            this.navbarItem.collapsed = value;
        }
    }

    private _collapsed: boolean;

    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    constructor(
        public elementRef: ElementRef
    ) {}

    getOuterElementWidth(): number {
        const { width, marginLeft, marginRight } = window.getComputedStyle(this.elementRef.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}


@Component({
    selector: 'mc-navbar-toggle',
    template: `
        <i mc-icon
           [class.mc-angle-left-M_24]="navbar.expanded"
           [class.mc-angle-right-M_24]="!navbar.expanded"
           *ngIf="!customIcon">
        </i>

        <ng-content select="[mc-icon]"></ng-content>

        <div class="mc-navbar-item__title" *ngIf="navbar.expanded">
            <ng-content select="mc-navbar-title"></ng-content>
        </div>

        <div class="mc-navbar-item__overlay"></div>
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
export class McNavbarToggle implements OnDestroy {
    @ContentChild(McIcon) customIcon: McIcon;

    constructor(
        public navbar: McVerticalNavbar,
        private ngZone: NgZone,
        @Optional() @Inject(DOCUMENT) private document: any
    ) {
        const window = this.getWindow();

        if (window) {
            this.ngZone.runOutsideAngular(() => {
                window.addEventListener('keydown', this.windowToggleHandler);
            });
        }
    }

    onKeydown($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.navbar.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    ngOnDestroy(): void {
        const window = this.getWindow();

        if (window) {
            window.removeEventListener('keydown', this.windowToggleHandler);
        }
    }

    private getWindow(): Window {
        return this.document?.defaultView || window;
    }

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.keyCode === NUMPAD_DIVIDE) {
            this.ngZone.run(() => this.navbar.toggle());
        }
    }
}


@Directive({
    selector: 'mc-navbar-toggle[mcCollapsedTooltip]',
    exportAs: 'mcCollapsedTooltip',
    host: {
        '[class.mc-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McNavbarToggleTooltipTrigger extends McTooltipTrigger {
    @Input('mcCollapsedTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    get disabled(): boolean {
        return this.navbar.expanded;
    }

    protected modifier: TooltipModifier = TooltipModifier.Default;

    constructor(
        public navbar: McVerticalNavbar,
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

        this.placement = PopUpPlacements.Right;
    }
}
