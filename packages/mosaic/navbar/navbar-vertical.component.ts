import {
    Component,
    ContentChild,
    Input,
    QueryList,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { McIcon } from '@ptsecurity/mosaic/icon';

import { McNavbarItem } from './navbar-item.component';


@Component({
    selector: 'mc-navbar-vertical',
    template: `
        <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
        <ng-content select="[mc-navbar-toggle], mc-navbar-toggle"></ng-content>
    `,
    host: {
        class: 'mc-navbar-vertical',
        '[class.mc-navbar_closed]': 'closed',
        '[class.mc-navbar_opened]': '!closed'
    },
    styleUrls: ['./navbar-vertical.scss'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbarVertical {
    @Input() closed: boolean = false;

    @ViewChildren(McNavbarItem) navbarItems: QueryList<McNavbarItem>;

    toggle(): void {
        this.closed = !this.closed;
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
        class: 'mc-navbar-item mc-navbar-toggle'
    },
    styleUrls: ['./navbar.scss'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbarToggle {
    @ContentChild(McIcon) customIcon: McIcon;

    constructor(public mcNavbar: McNavbarVertical) {}
}
