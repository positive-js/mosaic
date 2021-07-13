import {
    AfterContentInit,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { McIcon } from '@ptsecurity/mosaic/icon';

import { McNavbarDivider, McNavbarItem } from './navbar-item.component';


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
export class McNavbarVertical implements AfterContentInit {
    get closed() {
        return this._closed;
    }

    @Input()
    set closed(value: boolean) {
        this._closed = value;

        this.setClosedStateForItems(value);
    }

    private _closed: boolean = false;

    @ContentChildren(McNavbarItem, { descendants: true }) navbarItems: QueryList<McNavbarItem>;

    @ContentChildren(McNavbarDivider, { descendants: true }) navbarDividers: QueryList<McNavbarDivider>;

    toggle(): void {
        this.closed = !this.closed;
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.setClosedStateForItems(this.closed);

        this.navbarItems.changes
            .subscribe(this.setItemsState);
    }

    private setClosedStateForItems(value: boolean) {
        this.navbarItems.forEach((item) => {
            item.closed = value;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private setItemsState = () => {
        this.navbarItems.forEach((item) => item.vertical = true);
        this.navbarDividers.forEach((item) => item.vertical = true);
    }
}


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
    host: {
        class: 'mc-navbar-item mc-navbar-toggle mc-navbar-item_vertical'
    },
    styleUrls: ['./navbar.scss'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbarToggle {
    @ContentChild(McIcon) customIcon: McIcon;

    constructor(public mcNavbar: McNavbarVertical) {}
}
