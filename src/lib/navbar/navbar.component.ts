import { fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
    AfterViewInit,
    Component, Directive,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ContentChild,
    TemplateRef,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { SPACE } from '@ptsecurity/cdk/keycodes';
import { Platform } from '@ptsecurity/cdk/platform';
import { CanDisable, mixinDisabled } from '@ptsecurity/mosaic/core';


const COLLAPSED_CLASS: string = 'mc-navbar-collapsed-title';
const MC_ICON = 'mc-icon';
const MC_NAVBAR = 'mc-navbar';
const MC_NAVBAR_CONTAINER = 'mc-navbar-container';
const MC_NAVBAR_ITEM = 'mc-navbar-item';
const MC_NAVBAR_BRAND = 'mc-navbar-brand';
const MC_NAVBAR_TITLE = 'mc-navbar-title';
const MC_NAVBAR_LOGO = 'mc-navbar-logo';

export type McNavbarContainerPositionType = 'left' | 'right';

export interface IMcNavbarDropdownItem {
    link?: string;
    text: string;
}

@Directive({
    selector: MC_NAVBAR_LOGO,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McNavbarLogo {}

@Directive({
    selector: MC_NAVBAR_BRAND,
    host: {
        class: MC_NAVBAR_BRAND
    }
})
export class McNavbarBrand {}

@Directive({
    selector: MC_NAVBAR_TITLE,
    host: {
        class: MC_NAVBAR_TITLE
    }
})
export class McNavbarTitle {}

export class McNavbarItemBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McNavbarMixinBase = mixinDisabled(McNavbarItemBase);

@Component({
    selector: MC_NAVBAR_ITEM,
    template: `
        <a
            [attr.tabindex]=\"disabled ? -1 : tabIndex\"
            (click)="handleClickByItem()"
            (keydown)="handleKeydown($event)"
            class="mc-navbar-item"
        >
            <ng-content></ng-content>
            <i *ngIf="hasDropdownContent" mc-icon="mc-angle-M_16"></i>
        </a>
        <ul
            #dropdownContent
            *ngIf="hasDropdownContent"
            [ngClass]="{ 'is-collapsed': isCollapsed }"
            class="mc-navbar-dropdown"
        >
            <li
                *ngFor="let item of dropdownItems"
                (click)="handleClickByDropdownItem()"
                class="mc-navbar-dropdown-item"
            >
                <ng-container *ngIf="dropdownItemTmpl">
                    <ng-container *ngTemplateOutlet="dropdownItemTmpl; context: { $implicit: item }"></ng-container>
                </ng-container>
                <a
                    *ngIf="!dropdownItemTmpl"
                    [attr.href]="item.link"
                    [ngClass]="{ 'is-active': isActiveDropdownLink(item.link) }"
                    class="mc-navbar-dropdown-link"
                >{{ item.text }}</a>
            </li>
        </ul>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': '-1'
    }
})
export class McNavbarItem extends _McNavbarMixinBase implements OnInit, AfterViewInit, OnDestroy, CanDisable {

    @Input()
    tabIndex: number = 0;

    @Input()
    dropdownItems: IMcNavbarDropdownItem[] = [];

    @Input()
    set collapsedTitle(value: string) {
        this.elementRef.nativeElement.setAttribute('computedTitle', encodeURI(value));
    }

    @ContentChild('dropdownItemTmpl', { read: TemplateRef })
    dropdownItemTmpl: TemplateRef<IMcNavbarDropdownItem>;

    @ViewChild('dropdownContent', { read: ElementRef })
    dropdownContent: ElementRef;

    get hasDropdownContent() {
        return this.dropdownItems.length > 0;
    }

    isCollapsed: boolean = true;

    private _subscription: Subscription = new Subscription();
    private _focusMonitor$: Observable<FocusOrigin>;

    private get _dropdownElements(): HTMLElement[] {
        return this.dropdownContent ? this.dropdownContent.nativeElement.querySelectorAll('li > *') : [];
    }

    constructor(
        public  elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _platform: Platform,
        private _cdRef: ChangeDetectorRef
    ) {
        super(elementRef);
    }

    ngOnInit() {
        this.denyClickIfDisabled();

        this._focusMonitor$ = this._focusMonitor.monitor(this.elementRef.nativeElement, true);

        if (this.hasDropdownContent) {
            this.listenClickOutside();
        }
    }

    ngAfterViewInit() {
        if (!this.hasDropdownContent) {
            return;
        }

        this.startListenFocusDropdownItems();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
        this.stopListenFocusDropdownItems();
    }

    isActiveDropdownLink(link: string): boolean {
        if (!this._platform.isBrowser) {
            return false;
        }

        return window.location.href.indexOf(link) >= 0;
    }

    handleClickByItem() {
        this.toggleDropdown();
    }

    handleKeydown($event: KeyboardEvent) {
        const isNavbarItem = ($event.target as HTMLElement).classList.contains(MC_NAVBAR_ITEM);

        // tslint:disable-next-line
        if (this.hasDropdownContent && $event.keyCode === SPACE && isNavbarItem) {
            this.toggleDropdown();
        }
    }

    handleClickByDropdownItem() {
        this.forceCloseDropdown();
    }

    private listenClickOutside() {
        this._subscription.add(
            this._focusMonitor$.subscribe((origin) => {
                if (origin === null) {
                    this.forceCloseDropdown();
                }
            })
        );
    }

    private toggleDropdown() {
        this.isCollapsed = !this.isCollapsed;
    }

    private forceCloseDropdown() {
        this.isCollapsed = true;
        this._cdRef.detectChanges();
    }

    private startListenFocusDropdownItems() {
        this._dropdownElements.forEach((el) => {
            this._focusMonitor.monitor(el, true);
        });
    }

    private stopListenFocusDropdownItems() {
        this._dropdownElements.forEach((el) => {
            this._focusMonitor.stopMonitoring(el);
        });
    }

    // This method is required due to angular 2 issue https://github.com/angular/angular/issues/11200
    private denyClickIfDisabled() {
        const events: Event[] = this.elementRef.nativeElement.eventListeners('click');

        events.forEach((event) => this.elementRef.nativeElement.removeEventListener('click', event));

        this.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
            if (this.elementRef.nativeElement.hasAttribute('disabled')) {
                event.stopImmediatePropagation();
            }
        }, true);

        events.forEach((event) => this.elementRef.nativeElement.addEventListener('click', event));
    }
}

@Directive({
    selector: MC_NAVBAR_CONTAINER
})
export class McNavbarContainer {
    @Input()
    position: McNavbarContainerPositionType = 'left';

    @HostBinding('class')
    get cssClasses(): string {
        return this.position === 'left' ? 'mc-navbar-left' : 'mc-navbar-right';
    }
}

class CollapsibleItem {
    private _collapsed: boolean = false;

    constructor(
        public element: HTMLElement,
        public width: number
    ) {}

    processCollapsed(collapsed: boolean) {
        this._collapsed = collapsed;

        this.updateCollapsedClass();
    }

    private updateCollapsedClass() {
        if (this._collapsed) {
            this.element.classList.add(COLLAPSED_CLASS);
        } else {
            this.element.classList.remove(COLLAPSED_CLASS);
        }

    }
}

class CachedItemWidth {

    get canCollapse(): boolean {
        return this.itemsForCollapse.length > 0;
    }

    private _collapsedItemsWidth: number;

    get collapsedItemsWidth(): number {
        if (this._collapsedItemsWidth !== undefined) {
            return this._collapsedItemsWidth;
        }

        this.calculateAndCacheCollapsedItemsWidth();

        return this._collapsedItemsWidth;
    }

    constructor(
        public element: HTMLElement,
        public width: number,
        public itemsForCollapse: CollapsibleItem[] = []
    ) {}

    processCollapsed(collapsed: boolean) {
        if (this.itemsForCollapse.length > 0) {
            this.updateTitle(collapsed);
        }

        this.itemsForCollapse.forEach((item) => item.processCollapsed(collapsed));
    }

    private calculateAndCacheCollapsedItemsWidth() {
        this._collapsedItemsWidth = this.itemsForCollapse
            .reduce((acc, item) => acc + item.width, 0);
    }

    private getTitle(): string {
        const computedTitle = this.element.getAttribute('computedTitle');

        return computedTitle
            ? decodeURI(computedTitle)
            : (this.itemsForCollapse.length > 0 ? this.itemsForCollapse[0].element.innerText : '');
    }

    private updateTitle(collapsed: boolean) {
        if (collapsed) {
            this.element.setAttribute('title', this.getTitle());
        } else {
            this.element.removeAttribute('title');
        }
    }
}


@Component({
    selector: MC_NAVBAR,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <nav class="mc-navbar">
            <ng-content select="[${MC_NAVBAR_CONTAINER}],${MC_NAVBAR_CONTAINER}"></ng-content>
        </nav>
    `,
    styleUrls: ['./navbar.css'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbar implements AfterViewInit, OnDestroy {

    private readonly forceRecalculateItemsWidth: boolean = false;
    private readonly resizeDebounceInterval: number = 100;
    private readonly firstLevelElement: string = MC_NAVBAR_CONTAINER;
    private readonly secondLevelElements: string[] = [
        MC_NAVBAR_ITEM,
        MC_NAVBAR_BRAND,
        MC_NAVBAR_TITLE
    ];

    private _totalItemsWidths: number;
    private _itemsWidths: CachedItemWidth[];

    private get maxAllowedWidth(): number {
        return this._elementRef.nativeElement.querySelector('nav').getBoundingClientRect().width;
    }

    private get itemsWidths(): CachedItemWidth[] {
        if (this._itemsWidths !== undefined && !this.forceRecalculateItemsWidth) {
            return this._itemsWidths;
        }

        this.calculateAndCacheItemsWidth();

        return this._itemsWidths;
    }

    private get totalItemsWidth(): number {
        if (this._totalItemsWidths !== undefined && !this.forceRecalculateItemsWidth) {
            return this._totalItemsWidths;
        }

        this.calculateAndCacheTotalItemsWidth();

        return this._totalItemsWidths;
    }

    private _resizeSubscription: Subscription;

    constructor(
        private _elementRef: ElementRef
    ) {
        const resizeObserver = fromEvent(window, 'resize')
            .pipe(debounceTime(this.resizeDebounceInterval));

        this._resizeSubscription = resizeObserver.subscribe(this.updateCollapsed.bind(this));
    }

    updateCollapsed(): void {
        let collapseDelta = this.totalItemsWidth - this.maxAllowedWidth;

        for (let i = this.itemsWidths.length - 1; i >= 0; i--) {
            const item = this.itemsWidths[i];

            if (!item.canCollapse) {
                continue;
            }

            item.processCollapsed(collapseDelta > 0);
            collapseDelta -= item.collapsedItemsWidth;
        }
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(() => this.updateCollapsed(), 0);
    }

    ngOnDestroy() {
        this._resizeSubscription.unsubscribe();
    }

    private calculateAndCacheTotalItemsWidth() {
        this._totalItemsWidths = this.itemsWidths
            .reduce((acc, item) => acc + item.width, 0);
    }

    private getOuterElementWidth(element: HTMLElement): number {
        const baseWidth  = element.getBoundingClientRect().width;
        const marginRight = parseInt(getComputedStyle(element).getPropertyValue('margin-right'));
        const marginLeft = parseInt(getComputedStyle(element).getPropertyValue('margin-left'));

        return baseWidth + marginRight + marginLeft;
    }

    private calculateAndCacheItemsWidth() {
        const allItemsSelector = this.secondLevelElements
            .map((e: string) => `${this.firstLevelElement}>${e}`);
        const allItems: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll(allItemsSelector));

        this._itemsWidths = allItems
            .map((el) => new CachedItemWidth(el, this.getOuterElementWidth(el), this.getItemsForCollapse(el)));
    }

    private getItemsForCollapse(element: HTMLElement): CollapsibleItem[] {
        const icon = element.querySelector(`[${MC_ICON}],${MC_NAVBAR_LOGO},[${MC_NAVBAR_LOGO}]`);

        if (!icon) {
            return [];
        }

        return Array.from(element.querySelectorAll(MC_NAVBAR_TITLE))
            .map((el) => new CollapsibleItem(<HTMLElement> el, el.getBoundingClientRect().width));
    }
}
