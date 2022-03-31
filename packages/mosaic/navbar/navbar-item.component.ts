import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
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
import { DOWN_ARROW, ENTER, NUMPAD_DIVIDE, SLASH, SPACE } from '@ptsecurity/cdk/keycodes';
import { McButton, McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { PopUpPlacements, toBoolean } from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { MC_TOOLTIP_SCROLL_STRATEGY, McTooltipTrigger, TooltipModifier } from '@ptsecurity/mosaic/tooltip';
import { EMPTY, merge, Subject } from 'rxjs';
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
    selector: 'mc-navbar-item[bento], [mc-navbar-item][bento]',
    host: {
        class: 'mc-navbar-bento'
    }
})
export class McNavbarBento {}


@Directive({
    selector: 'mc-navbar-title, [mc-navbar-title]',
    host: {
        class: 'mc-navbar-title',
        '[class.mc-navbar-title_small]': 'isTextOverflown',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class McNavbarTitle implements AfterViewInit {
    readonly hovered = new Subject<boolean>();

    outerElementWidth: number;
    isTextOverflown: boolean = false;

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

    checkTextOverflown() {
        // tslint:disable-next-line:no-magic-numbers
        this.isTextOverflown = this.text.length > 18;
    }

    ngAfterViewInit(): void {
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
        '[class.mc-hovered]': 'hovered',
        '[class.layout-column]': 'hasBento',
        '[class.layout-row]': '!hasBento'
    }
})
export class McNavbarBrand implements AfterContentInit, OnDestroy {
    @ContentChild(McNavbarLogo) logo: McNavbarLogo;
    @ContentChild(McNavbarTitle) title: McNavbarTitle;

    hovered = false;

    get hasBento(): boolean {
        return !!this.navbar?.bento;
    }

    private destroyed = new Subject<void>();

    constructor(@Optional() private navbar: McVerticalNavbar) {
    }

    ngAfterContentInit(): void {
        merge(
            this.logo ? this.logo.hovered : EMPTY,
            this.title ? this.title.hovered : EMPTY
        )
        .pipe(takeUntil(this.destroyed))
        .subscribe((value: boolean) => this.hovered = value);

        this.navbar?.animationDone
            .subscribe(() => this.title?.checkTextOverflown());
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

        '(focus)': 'onFocusHandler()',
        '(blur)': 'blur()'
    }
})
export class McNavbarFocusableItem implements IFocusableOption, AfterContentInit, OnDestroy {
    @ContentChild(McNavbarTitle) title: McNavbarTitle;

    @ContentChild(McButton) button: McButton;

    readonly onFocus = new Subject<McNavbarFocusableItemEvent>();

    readonly onBlur = new Subject<McNavbarFocusableItemEvent>();

    get hasFocus(): boolean {
        return !!this.button?.hasFocus || this._hasFocus;
    }

    set hasFocus(value: boolean) {
        this._hasFocus = value;
    }

    private _hasFocus: boolean = false;

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

    ngAfterContentInit(): void {
        if (this.button) {
            this.button.tabIndex = -1;
        }

        this.focusMonitor.monitor(this.elementRef);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    onFocusHandler() {
        if (this.disabled || this.hasFocus) { return; }

        this.onFocus.next({ item: this });

        this.hasFocus = true;

        this.changeDetector.markForCheck();

        this.elementRef.nativeElement.focus();
    }

    focus(origin?: FocusOrigin) {
        if (this.disabled || this.hasFocus) { return origin; }

        if (origin === 'keyboard') {
            this.focusMonitor.focusVia(this.elementRef, origin);
        }

        if (this.button) {
            this.button.focusViaKeyboard();

            this.changeDetector.markForCheck();

            return;
        }

        this.onFocusHandler();
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
                    this._hasFocus = false;

                    if (this.button?.hasFocus) { return; }

                    this.onBlur.next({ item: this });
                });
            });
    }

    getLabel(): string {
        return this.title?.text || '';
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
    readonly state = new Subject<void>();

    get horizontal(): boolean {
        return this._horizontal;
    }

    set horizontal(value: boolean) {
        this._horizontal = value;

        this.state.next();
    }

    private _horizontal: boolean;

    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = value;

        this.state.next();
    }

    private _vertical: boolean;

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        this._collapsed = value;

        this.state.next();
    }

    private _collapsed: boolean;

    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    constructor(public elementRef: ElementRef) {}

    getOuterElementWidth(): number {
        const { width, marginLeft, marginRight } = window.getComputedStyle(this.elementRef.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}


@Component({
    selector: 'mc-navbar-item, [mc-navbar-item]',
    exportAs: 'mcNavbarItem',
    templateUrl: './navbar-item.component.html',
    host: {
        class: 'mc-navbar-item',
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

    @Input() collapsedText: string;

    @Input()
    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        if (this._collapsed !== value) {
            this._collapsed = value;

            this.updateTooltip();
        }
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
        return this.collapsedText || this.title?.text || null;
    }

    get subTitleText(): string | null {
        return this.subTitle?.text || null;
    }

    get disabled(): boolean {
        if (this._disabled !== undefined) {
            return this._disabled;
        }

        return (!this.collapsed && !this.hasCroppedText) || !this.title;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
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
        @Optional() private dropdownTrigger: McDropdownTrigger,
        @Optional() private bento: McNavbarBento
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

        if (this.hasDropDownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }

        this.rectangleElement.state
            .subscribe(() => {
                this.collapsed = this.rectangleElement.collapsed;

                this.changeDetectorRef.detectChanges();
            });
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

        if (this.rectangleElement.vertical) {
            this.placement = PopUpPlacements.Right;
        }

        this.changeDetectorRef.markForCheck();
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

    onKeyDown($event: KeyboardEvent) {
        if (!this.hasDropDownTrigger) { return; }

        if (
            [ENTER, SPACE].includes($event.keyCode) ||
            (this.rectangleElement.horizontal && $event.keyCode === DOWN_ARROW)
        ) {
            this.dropdownTrigger.openedBy = 'keyboard';
            this.dropdownTrigger.open();

            $event.preventDefault();
        }
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
        '[class.mc-tooltip_open]': 'isOpen',

        '(keydown)': 'onKeydown($event)',
        '(click)': 'toggle()',
        '(touchend)': 'handleTouchend()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarToggle extends McTooltipTrigger implements OnDestroy {
    @ContentChild(McIcon) customIcon: McIcon;

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
        private changeDetectorRef: ChangeDetectorRef,
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        @Optional() @Inject(DOCUMENT) private document: any
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

        this.placement = PopUpPlacements.Right;

        const window = this.getWindow();

        if (window) {
            this.ngZone.runOutsideAngular(() => {
                window.addEventListener('keydown', this.windowToggleHandler);
            });
        }
    }

    onKeydown($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }

        super.handleKeydown($event);
    }

    ngOnDestroy(): void {
        const window = this.getWindow();

        if (window) {
            window.removeEventListener('keydown', this.windowToggleHandler);
        }
    }

    toggle = () => {
        this.navbar.toggle();

        this.changeDetectorRef.markForCheck();

        this.hide();
    }

    private getWindow(): Window {
        return this.document?.defaultView || window;
    }

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && [NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) {
            this.ngZone.run(this.toggle);
        }
    }
}
