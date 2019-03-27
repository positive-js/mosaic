import { Component, Directive, HostBinding, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { expandVerticalNavbarAnimation } from '@ptsecurity/mosaic/vertical-navbar/vertical-navbar.animation';


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
export class McVerticalNavbar {
    expanded: boolean = false;
    animating: boolean = false;
}
