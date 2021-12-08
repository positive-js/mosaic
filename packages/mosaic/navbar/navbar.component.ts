import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    Input,
    OnDestroy,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import {
    ENTER,
    isVerticalMovement,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB
} from '@ptsecurity/cdk/keycodes';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, startWith, takeUntil } from 'rxjs/operators';

import {
    McNavbarFocusableItem,
    McNavbarFocusableItemEvent,
    McNavbarItem,
    McNavbarRectangleElement
} from './navbar-item.component';


export type McNavbarContainerPositionType = 'left' | 'right';


@Directive()
export class McFocusableComponent implements AfterContentInit, OnDestroy {
    @ContentChildren(forwardRef(() => McNavbarFocusableItem), { descendants: true })
    focusableItems: QueryList<McNavbarFocusableItem>;

    keyManager: FocusKeyManager<McNavbarFocusableItem>;

    @Input()
    get tabIndex(): any {
        return this._tabIndex;
    }

    set tabIndex(value: any) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    get optionFocusChanges(): Observable<McNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((item) => item.onFocus));
    }

    get optionBlurChanges(): Observable<McNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((option) => option.onBlur));
    }

    protected readonly destroyed = new Subject<void>();

    private optionFocusSubscription: Subscription | null;
    private optionBlurSubscription: Subscription | null;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {}

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<McNavbarFocusableItem>(this.focusableItems)
        .withTypeAhead();

        this.keyManager.setFocusOrigin('keyboard');

        this.keyManager.tabOut
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this.tabIndex = -1;

                setTimeout(() => {
                    this.tabIndex = 0;
                    this.changeDetectorRef.markForCheck();
                });
            });

        this.focusableItems.changes
            .pipe(startWith(null), takeUntil(this.destroyed))
            .subscribe(() => {
                this.resetOptions();

                // Check to see if we need to update our tab index
                this.updateTabIndex();
            });
    }

    ngOnDestroy() {
        this.destroyed.next();

        this.destroyed.complete();
    }

    focus(): void {
        if (this.focusableItems.length === 0) { return; }

        this.keyManager.setFirstItemActive();
    }

    blur() {
        if (!this.hasFocusedItem()) {
            this.keyManager.setActiveItem(-1);
        }

        this.changeDetectorRef.markForCheck();
    }

    protected resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    protected dropSubscriptions() {
        if (this.optionFocusSubscription) {
            this.optionFocusSubscription.unsubscribe();
            this.optionFocusSubscription = null;
        }

        if (this.optionBlurSubscription) {
            this.optionBlurSubscription.unsubscribe();
            this.optionBlurSubscription = null;
        }
    }

    private listenToOptionsFocus(): void {
        this.optionFocusSubscription = this.optionFocusChanges
            .subscribe((event) => {
                const index: number = this.focusableItems.toArray().indexOf(event.item);

                if (this.isValidIndex(index)) {
                    this.keyManager.updateActiveItem(index);
                }
            });

        this.optionBlurSubscription = this.optionBlurChanges
            .subscribe(() => this.blur());
    }

    private updateTabIndex(): void {
        this.tabIndex = this.focusableItems.length === 0 ? -1 : 0;
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.focusableItems.length;
    }

    private hasFocusedItem() {
        return this.focusableItems.some((item) => item.hasFocus);
    }
}


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
    styleUrls: [
        './navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss'
    ],
    host: {
        class: 'mc-navbar',

        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)',

        '(window:resize)': 'resizeStream.next($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbar extends McFocusableComponent implements AfterViewInit, AfterContentInit, OnDestroy {
    @ContentChildren(forwardRef(() => McNavbarRectangleElement), { descendants: true })
    rectangleElements: QueryList<McNavbarRectangleElement>;

    @ContentChildren(forwardRef(() => McNavbarItem), { descendants: true }) navbarItems: QueryList<McNavbarItem>;

    readonly resizeStream = new Subject<Event>();

    private readonly resizeDebounceInterval: number = 100;

    private get width(): number {
        return this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    private get totalItemsWidth(): number {
        return this.rectangleElements
            .reduce((acc, item) => acc + item.getOuterElementWidth(), 0);
    }

    private get collapsableItems(): McNavbarItem[] {
        return this.navbarItems
            .toArray()
            .filter((item) => item.icon && item.title && item.collapsable)
            .reverse();
    }

    private resizeSubscription: Subscription;

    constructor(
        private elementRef: ElementRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef);

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateExpandedStateForItems);
    }

    ngAfterContentInit(): void {
        this.setItemsState();

        this.rectangleElements.changes
            .subscribe(this.setItemsState);

        super.ngAfterContentInit();

        this.keyManager.withHorizontalOrientation('ltr');
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(this.updateExpandedStateForItems);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();

        super.ngOnDestroy();
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if ([SPACE, ENTER, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === RIGHT_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === LEFT_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    updateExpandedStateForItems = () => {
        const collapseDelta = this.totalItemsWidth - this.width;

        const needCollapse = collapseDelta > 0;

        if (needCollapse) {
            this.collapseItems(collapseDelta);
        } else {
            this.expandItems(collapseDelta);
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

    private expandItems(collapseDelta: number) {
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
        Promise.resolve()
            .then(() => this.rectangleElements?.forEach((item) => item.horizontal = true));
    }
}
