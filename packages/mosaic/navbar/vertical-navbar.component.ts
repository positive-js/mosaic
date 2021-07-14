import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { CanDisableCtor, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';

import { McNavbarItemBase } from './navbar-item.component';


@Component({
    selector: 'mc-vertical-navbar',
    template: `
        <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
        <ng-content select="[mc-navbar-toggle], mc-navbar-toggle"></ng-content>
    `,
    host: {
        class: 'mc-vertical-navbar',
        '[class.mc-closed]': 'closed',
        '[class.mc-opened]': '!closed'
    },
    styleUrls: ['./vertical-navbar.scss'],
    encapsulation: ViewEncapsulation.None
})
export class McVerticalNavbar implements AfterContentInit {
    get closed() {
        return this._closed;
    }

    @Input()
    set closed(value: boolean) {
        this._closed = value;

        this.setClosedStateForItems(value);
    }

    private _closed: boolean = false;

    @ContentChildren(McNavbarItemBase, { descendants: true }) navbarBaseItems: QueryList<McNavbarItemBase>;

    toggle(): void {
        this.closed = !this.closed;
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.setClosedStateForItems(this.closed);

        this.navbarBaseItems.changes
            .subscribe(this.setItemsState);
    }

    private setClosedStateForItems(value: boolean) {
        this.navbarBaseItems.forEach((item) => {
            item.closed = value;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private setItemsState = () => {
        this.navbarBaseItems.forEach((item) => item.vertical = true);
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
           [class.mc-angle-left-M_16]="!mcNavbar.closed"
           [class.mc-angle-right-M_16]="mcNavbar.closed"
           *ngIf="!customIcon">
        </i>

        <ng-content select="[mc-icon]"></ng-content>
        <ng-content select="mc-navbar-title" *ngIf="!mcNavbar.closed"></ng-content>
    `,
    styleUrls: ['./navbar.scss'],
    host: {
        class: 'mc-navbar-item mc-navbar-toggle mc-vertical',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    },
    inputs: ['tabIndex'],
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
