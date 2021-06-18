import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    QueryList,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CachedItemWidth, CollapsibleItem, McNavbarItem } from './navbar-item.component';


export type McNavbarContainerPositionType = 'left' | 'right';


@Directive({
    selector: 'mc-navbar-container',
    host: {
        class: 'mc-navbar-container',
        '[class.mc-navbar-left]': 'this.position === "left"',
        '[class.mc-navbar-right]': 'this.position == "right"',
        '[class.mc-navbar_top]': 'this.position == "top"',
        '[class.mc-navbar_bottom]': 'this.position == "bottom"'
    }
})
export class McNavbarContainer {
    @Input() position: McNavbarContainerPositionType;
}

@Component({
    selector: 'mc-navbar',
    template: `
        <nav class="mc-navbar">
            <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
        </nav>
    `,
    styleUrls: ['./navbar.scss'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbar implements AfterViewInit, OnDestroy {
    @ViewChildren(McNavbarItem) navbarItems: QueryList<McNavbarItem>;

    private readonly forceRecalculateItemsWidth: boolean = false;
    private readonly resizeDebounceInterval: number = 100;
    private readonly firstLevelElement: string = 'mc-navbar-container';
    private readonly secondLevelElements: string[] = [
        'mc-navbar-item',
        'mc-navbar-brand',
        'mc-navbar-title'
    ];

    private totalItemsWidths: number;

    private get maxAllowedWidth(): number {
        return this.elementRef.nativeElement.querySelector('nav').getBoundingClientRect().width;
    }

    private get itemsWidths(): CachedItemWidth[] {
        if (this._itemsWidths !== undefined && !this.forceRecalculateItemsWidth) {
            return this._itemsWidths;
        }

        this.calculateAndCacheItemsWidth();

        return this._itemsWidths;
    }

    private _itemsWidths: CachedItemWidth[];

    private get totalItemsWidth(): number {
        if (this.totalItemsWidths !== undefined && !this.forceRecalculateItemsWidth) {
            return this.totalItemsWidths;
        }

        this.calculateAndCacheTotalItemsWidth();

        return this.totalItemsWidths;
    }

    private resizeSubscription: Subscription;

    constructor(private elementRef: ElementRef,) {
        this.subscribeOnResizeEvents();
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(() => this.updateCollapsed(), 0);
    }

    ngOnDestroy() {
        this.resizeSubscription?.unsubscribe();
    }

    updateCollapsed(): void {
        let collapseDelta = this.totalItemsWidth - this.maxAllowedWidth;

        for (let i = this.itemsWidths.length - 1; i >= 0; i--) {
            const item = this.itemsWidths[i];

            if (!item.canCollapse) { continue; }

            item.processCollapsed(collapseDelta > 0);
            collapseDelta -= item.collapsedItemsWidth;
        }
    }

    private subscribeOnResizeEvents() {
        this.resizeSubscription = fromEvent(window, 'resize')
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateCollapsed.bind(this));
    }

    private calculateAndCacheTotalItemsWidth() {
        this.totalItemsWidths = this.itemsWidths
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

        const allItems: HTMLElement[] = Array.from(this.elementRef.nativeElement.querySelectorAll(allItemsSelector));

        this._itemsWidths = allItems
            .map((el) => new CachedItemWidth(el, this.getOuterElementWidth(el), this.getItemsForCollapse(el)));
    }

    private getItemsForCollapse(element: HTMLElement): CollapsibleItem[] {
        const icon = element.querySelector(`[mc-icon],mc-navbar-logo,[mc-navbar-logo]`);

        if (!icon) { return []; }

        return Array.from(element.querySelectorAll('mc-navbar-title'))
            .map((el) => new CollapsibleItem(<HTMLElement> el, el.getBoundingClientRect().width));
    }
}
