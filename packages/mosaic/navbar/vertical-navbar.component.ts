import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { mixinDisabled, mixinTabIndex } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';

import { McNavbarItemBase } from './navbar-item.component';
import { toggleVerticalNavbarAnimation } from './vertical-navbar.animation';


@Component({
    selector: 'mc-vertical-navbar',
    exportAs: 'McVerticalNavbar',
    template: `
        <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
        <ng-content select="[mc-navbar-toggle], mc-navbar-toggle"></ng-content>
    `,
    styleUrls: ['./vertical-navbar.scss'],
    host: {
        class: 'mc-vertical-navbar',
        '[class.mc-closed]': '!expanded',
        '[class.mc-opened]': 'expanded',
        '[@toggle]': 'expanded'
    },
    animations: [toggleVerticalNavbarAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McVerticalNavbar implements AfterContentInit {
    get expanded() {
        return this._expanded;
    }

    @Input()
    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.setClosedStateForItems(value);
    }

    private _expanded: boolean = false;

    @ContentChildren(McNavbarItemBase, { descendants: true }) navbarBaseItems: QueryList<McNavbarItemBase>;

    toggle(): void {
        this.expanded = !this.expanded;
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.setClosedStateForItems(this.expanded);

        this.navbarBaseItems.changes
            .subscribe(this.setItemsState);
    }

    private setClosedStateForItems(value: boolean) {
        this.navbarBaseItems?.forEach((item) => {
            item.closed = !value;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private setItemsState = () => {
        Promise.resolve().then(() => this.navbarBaseItems?.forEach((item) => item.vertical = true));
    }
}

export class McNavbarToggleBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McNavbarToggleMixinBase = mixinTabIndex(mixinDisabled(McNavbarToggleBase));

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
