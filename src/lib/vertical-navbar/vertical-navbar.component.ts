import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
    Input,
    ChangeDetectorRef
} from '@angular/core';

import { toggleVerticalNavbarAnimation } from './vertical-navbar.animation';


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
        toggleVerticalNavbarAnimation()
    ]
})
export class McVerticalNavbar {

    @Input() expanded: boolean = false;

    constructor(
        private cd: ChangeDetectorRef
    ) {}

    toggle() {
        this.expanded = ! this.expanded;
        this.cd.markForCheck();
    }
}
