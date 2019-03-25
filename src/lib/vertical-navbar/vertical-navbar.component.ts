import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import { MC_NAVBAR_ITEM } from '@ptsecurity/mosaic/vertical-navbar/vertical-navbar-item.component';
import { expandVerticalNavbarAnimation } from '@ptsecurity/mosaic/vertical-navbar/vertical-navbar.animation';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


const COLLAPSED_CLASS: string = 'mc-navbar-collapsed-title';
const MC_ICON = 'mc-icon';
const MC_NAVBAR = 'mc-vertical-navbar';
const MC_NAVBAR_CONTAINER = 'mc-vertical-navbar-container';
const MC_NAVBAR_BRAND = 'mc-vertical-navbar-brand';
const MC_NAVBAR_TITLE = 'mc-vertical-navbar-title';
const MC_NAVBAR_LOGO = 'mc-vertical-navbar-logo';
const MC_NAVBAR_ITEM_ICON = 'mc-vertical-navbar-icon';
const MC_NAVBAR_ITEM_BADGE = 'mc-vertical-navbar-badge';

export type McVerticalNavbarContainerPositionType = 'top' | 'bottom';


@Directive({
    selector: MC_NAVBAR_LOGO,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McNavbarLogo {}

@Directive({
    selector: MC_NAVBAR_ITEM_ICON,
    host: {
        class: MC_NAVBAR_ITEM_ICON
    }
})
export class McNavbarItemIcon {}

@Component({
    selector: MC_NAVBAR_ITEM_BADGE,
    template: `
        <span class="mc-badge mc-badge_warning">
            <ng-content></ng-content>
        </span>
    `,
    host: {
        class: MC_NAVBAR_ITEM_BADGE
    }
})
export class McNavbarItemBadge {}

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


@Directive({
    selector: MC_NAVBAR_CONTAINER
})
export class McVerticalNavbarContainer {
    @Input()
    position: McVerticalNavbarContainerPositionType = 'top';

    @HostBinding('class')
    get cssClasses(): string {
        return this.position === 'top' ? 'mc-vertical-navbar-top' : 'mc-vertical-navbar-bottom';
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
    templateUrl: './vertical-navbar.component.html',
    styleUrls: ['./vertical-navbar.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        expandVerticalNavbarAnimation()
    ]
})
export class McVerticalNavbar implements AfterViewInit, OnDestroy {

    collapsed: boolean = true;
    animating: boolean = false;

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
