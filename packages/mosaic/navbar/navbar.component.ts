import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { McNavbarItem, McNavbarItemBase } from './navbar-item.component';


export type McNavbarContainerPositionType = 'left' | 'right';


@Directive({
    selector: 'mc-navbar-container',
    host: {
        class: 'mc-navbar-container'
    }
})
export class McNavbarContainer {}

@Component({
    selector: 'mc-navbar',
    template: `<ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>`,
    styleUrls: ['./navbar.scss'],
    host: {
        class: 'mc-navbar',
        '(window:resize)': 'resizeStream.next($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbar implements AfterViewInit, AfterContentInit, OnDestroy {
    @ContentChildren(McNavbarItemBase, { descendants: true }) navbarBaseItems: QueryList<McNavbarItemBase>;

    @ContentChildren(McNavbarItem, { descendants: true }) navbarItems: QueryList<McNavbarItem>;

    readonly resizeStream = new Subject<Event>();

    private readonly resizeDebounceInterval: number = 100;

    private get width(): number {
        return this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    private get totalItemsWidth(): number {
        return this.navbarBaseItems
            .reduce((acc, item) => acc + item.getOuterElementWidth(), 0);
    }

    private get collapsableItems(): McNavbarItem[] {
        return this.navbarItems
            .toArray()
            .filter((item) => item.icon && item.title && item.collapsable)
            .reverse();
    }

    private resizeSubscription: Subscription;

    constructor(private elementRef: ElementRef) {
        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateCollapsed);
    }

    ngAfterContentInit(): void {
        this.setItemsState();

        this.navbarBaseItems.changes
            .subscribe(this.setItemsState);
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(this.updateCollapsed);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
    }

    updateCollapsed = () => {
        const collapseDelta = this.totalItemsWidth - this.width;

        const needCollapse = collapseDelta > 0;

        if (needCollapse) {
            this.collapseItems(collapseDelta);
        } else {
            this.unCollapseItems(collapseDelta);
        }
    }

    private collapseItems(collapseDelta: number) {
        let delta = collapseDelta;

        const unCollapsedItems = this.collapsableItems
            .filter((item) => !item.collapsed);

        for (const item of unCollapsedItems) {
            item.collapsed = true;
            delta -= item.getTitleWidth();

            if (delta < 0) { break; }
        }
    }

    private unCollapseItems(collapseDelta: number) {
        let delta = collapseDelta;

        this.collapsableItems
            .filter((item) => item.collapsed)
            .forEach((item) => {
                if (delta + item.getTitleWidth() < 0) {
                    item.collapsed = false;
                    delta += item.getTitleWidth();
                }
            });
    }

    private setItemsState = () => {
        Promise.resolve().then(() => this.navbarBaseItems?.forEach((item) => item.horizontal = true));
    }
}
