import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, Input } from '@angular/core';

import { expandVerticalNavbarAnimation } from './vertical-navbar.animation';


@Directive({
    selector: 'mc-vertical-navbar-header, a[mc-vertical-navbar-header]',
    host: {
        class: 'mc-vertical-navbar-header'
    }
})
export class McVerticalNavbarHeader {}

@Directive({
    selector: 'mc-vertical-navbar-title',
    host: {
        class: 'mc-vertical-navbar-title'
    }
})
export class McVerticalNavbarTitle {}

@Component({
    selector: 'mc-vertical-navbar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './vertical-navbar.component.html',
    styleUrls: ['./vertical-navbar.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        expandVerticalNavbarAnimation()
    ]
})
export class McVerticalNavbar {

    toggle() {
        this.expanded = ! this.expanded;
    }

    animating: boolean = false;

    @Input()
    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(value: boolean) {
        this._expanded = value;
        this.animating = true;
    }
    private _expanded: boolean = false;
}
