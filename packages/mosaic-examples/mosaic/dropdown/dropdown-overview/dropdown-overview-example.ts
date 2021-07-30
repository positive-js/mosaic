import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic dropdown
 */
@Component({
    selector: 'dropdown-overview-example',
    templateUrl: 'dropdown-overview-example.html',
    styleUrls: ['dropdown-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class DropdownOverviewExample {
    someValue = 'Lazy Value';
    disabled = false;

    toggleDisabled() {
        this.disabled = !this.disabled;
    }
}
