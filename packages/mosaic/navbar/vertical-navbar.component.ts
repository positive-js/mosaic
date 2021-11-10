import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
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
import { CanDisableCtor, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McNavbarFocusableItem, McNavbarFocusableItemEvent, McNavbarRectangleElement } from './navbar-item.component';
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
        '[class.mc-closed]': '!expanded',
        '[class.mc-opened]': 'expanded',
        '[@toggle]': 'expanded',
        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'onKeyDown($event)',
    },
    animations: [toggleVerticalNavbarAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McVerticalNavbar extends McNavbarMixinBase implements AfterContentInit {
    @ContentChildren(McNavbarRectangleElement, { descendants: true })
    rectangleElements: QueryList<McNavbarRectangleElement>;

    @ContentChildren(McNavbarFocusableItem, { descendants: true }) items: QueryList<McNavbarFocusableItem>;

    keyManager: FocusKeyManager<McNavbarFocusableItem>;

    get expanded() {
        return this._expanded;
    }

    @Input()
    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.setClosedStateForItems(value);
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
        return merge(...this.items.map((item) => item.onFocus));
    }

    get optionBlurChanges(): Observable<McNavbarFocusableItemEvent> {
        return merge(...this.items.map((option) => option.onBlur));
    }

    userTabIndex: number | null = null;

    /** Emits whenever the component is destroyed. */
    private readonly destroyed = new Subject<void>();

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef);
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.setClosedStateForItems(this.expanded);

        this.rectangleElements.changes
            .subscribe(this.setItemsState);

        this.keyManager = new FocusKeyManager<McNavbarFocusableItem>(this.items)
            .withVerticalOrientation(true);

        this.keyManager.tabOut
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this._tabIndex = -1;

                setTimeout(() => {
                    this._tabIndex = this.userTabIndex || 0;
                    this.changeDetectorRef.markForCheck();
                });
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
        if (this.items.length === 0) { return; }

        this.keyManager.setFirstItemActive();
    }

    blur() {
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

    private hasFocusedItem() {
        return this.items.some((item) => item.hasFocus);
    }

    private setClosedStateForItems(value: boolean) {
        this.rectangleElements?.forEach((item) => {
            item.closed = !value;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private setItemsState = () => {
        Promise.resolve().then(() => this.rectangleElements?.forEach((item) => item.vertical = true));
    }
}

export class McNavbarToggleBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McNavbarToggleMixinBase: HasTabIndexCtor & CanDisableCtor &
    typeof McNavbarToggleBase = mixinTabIndex(mixinDisabled(McNavbarToggleBase));

@Component({
    selector: 'mc-navbar-toggle',
    template: `
        <i mc-icon
           [class.mc-angle-left-M_16]="mcNavbar.expanded"
           [class.mc-angle-right-M_16]="!mcNavbar.expanded"
           *ngIf="!customIcon">
        </i>

        <ng-content select="[mc-icon]"></ng-content>
        <ng-content select="mc-navbar-title" *ngIf="mcNavbar.expanded"></ng-content>
    `,
    styleUrls: ['./navbar.scss'],
    host: {
        class: 'mc-navbar-item mc-navbar-toggle mc-vertical',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    },
    inputs: ['tabIndex'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarToggle extends McNavbarToggleMixinBase {
    @ContentChild(McIcon) customIcon: McIcon;

    constructor(
        public mcNavbar: McVerticalNavbar,
        private focusMonitor: FocusMonitor,
        private elementRef: ElementRef
    ) {
        super(elementRef);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    ngAfterContentInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }
}
