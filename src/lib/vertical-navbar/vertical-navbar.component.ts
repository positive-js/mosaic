import { Component, Directive, HostBinding, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { expandVerticalNavbarAnimation } from '@ptsecurity/mosaic/vertical-navbar/vertical-navbar.animation';


const MC_NAVBAR = 'mc-vertical-navbar';
const MC_NAVBAR_CONTAINER = 'mc-vertical-navbar-container';
const MC_NAVBAR_HEADER = 'mc-vertical-navbar-header';
const MC_NAVBAR_TITLE = 'mc-vertical-navbar-title';
const MC_NAVBAR_LOGO = 'mc-vertical-navbar-logo';

export type McVerticalNavbarContainerPositionType = 'top' | 'bottom';


@Directive({
    selector: MC_NAVBAR_LOGO,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McVerticalNavbarLogo {}

@Directive({
    selector: `${MC_NAVBAR_HEADER}, [${MC_NAVBAR_HEADER}]`,
    host: {
        class: MC_NAVBAR_HEADER
    }
})
export class McVerticalNavbarBrand {}

@Directive({
    selector: MC_NAVBAR_TITLE,
    host: {
        class: MC_NAVBAR_TITLE
    }
})
export class McVerticalNavbarTitle {}


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
    styleUrls: ['./vertical-navbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        expandVerticalNavbarAnimation()
    ]
})
export class McVerticalNavbar {

    animating: boolean = false;

    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(value: boolean) {
        this._expanded = value;
        this.animating = true;
    }
    private _expanded: boolean = false;
}
