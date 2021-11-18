import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import {
    DOWN_ARROW,
    ENTER,
    isVerticalMovement,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import {
    McNavbarFocusableItem,
    McNavbarFocusableItemEvent,
    McNavbarItem,
    McNavbarRectangleElement
} from './navbar-item.component';
import { toggleVerticalNavbarAnimation } from './vertical-navbar.animation';


export class McNavbarBase {
    constructor(public elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McNavbarMixinBase: CanDisableCtor & typeof McNavbarBase = mixinDisabled(McNavbarBase);


@Component({
    selector: 'mc-vertical-navbar',
    exportAs: 'McVerticalNavbar',
    template: `
        <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
        <ng-content select="[mc-navbar-toggle], mc-navbar-toggle"></ng-content>
    `,
    styleUrls: [
        './vertical-navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss'
    ],
    inputs: ['disabled'],
    host: {
        class: 'mc-vertical-navbar',
        '[class.mc-collapsed]': '!expanded',
        '[class.mc-expanded]': 'expanded',
        '[@toggle]': 'expanded',
        '[attr.tabindex]': 'tabIndex',

        '(@toggle.done)': 'animationDone.next()',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'onKeyDown($event)'
    },
    animations: [toggleVerticalNavbarAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McVerticalNavbar extends McNavbarMixinBase implements AfterContentInit {
    @ContentChildren(forwardRef(() => McNavbarRectangleElement), { descendants: true })
    rectangleElements: QueryList<McNavbarRectangleElement>;

    @ContentChildren(forwardRef(() => McNavbarFocusableItem), { descendants: true })
    focusableItems: QueryList<McNavbarFocusableItem>;

    @ContentChildren(forwardRef(() => McNavbarItem), { descendants: true }) items: QueryList<McNavbarItem>;

    keyManager: FocusKeyManager<McNavbarFocusableItem>;

    readonly animationDone = new Subject<void>();

    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    @Input()
    get tabIndex(): any {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: any) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    get optionFocusChanges(): Observable<McNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((item) => item.onFocus));
    }

    get optionBlurChanges(): Observable<McNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((option) => option.onBlur));
    }

    userTabIndex: number | null = null;

    /** Emits whenever the component is destroyed. */
    private readonly destroyed = new Subject<void>();

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef);

        this.animationDone
            .subscribe(this.updateTooltipForItems);
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.updateExpandedStateForItems();
        this.updateTooltipForItems();

        this.rectangleElements.changes
            .subscribe(this.setItemsState);

        this.keyManager = new FocusKeyManager<McNavbarFocusableItem>(this.focusableItems)
            .withVerticalOrientation(true);

        this.keyManager.setFocusOrigin('keyboard');

        this.keyManager.tabOut
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this._tabIndex = -1;

                setTimeout(() => {
                    this._tabIndex = this.userTabIndex || 0;
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

    toggle(): void {
        this.expanded = !this.expanded;
    }

    focus(): void {
        console.log('focus: ');
        if (this.focusableItems.length === 0) { return; }

        this.keyManager.setFirstItemActive();
    }

    blur() {
        console.log('blur(): ');
        if (!this.hasFocusedItem()) {
            this.keyManager.setActiveItem(-1);
        }

        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent) {
        console.log('onKeyDown: ');
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if ([SPACE, ENTER, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        }
    }

    protected updateTabIndex(): void {
        this._tabIndex = this.userTabIndex || (this.focusableItems.length === 0 ? -1 : 0);
    }

    private resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    private dropSubscriptions() {
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
                console.log('this.optionFocusChanges: ');
                const index: number = this.focusableItems.toArray().indexOf(event.item);

                if (this.isValidIndex(index)) {
                    this.keyManager.updateActiveItem(index);
                }
            });

        this.optionBlurSubscription = this.optionBlurChanges
            .subscribe(() => this.blur());
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.focusableItems.length;
    }

    private hasFocusedItem() {
        return this.focusableItems.some((item) => item.hasFocus);
    }

    private updateExpandedStateForItems = () => {
        this.rectangleElements?.forEach((item) => {
            item.collapsed = !this.expanded;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private updateTooltipForItems = () => {
        this.items.forEach((item) => item.updateTooltip());
    }

    private setItemsState = () => {
        Promise.resolve()
            .then(() => this.rectangleElements?.forEach((item) => item.vertical = true));
    }
}
