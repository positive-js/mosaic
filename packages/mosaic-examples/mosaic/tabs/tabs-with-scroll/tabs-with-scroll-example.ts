import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Navbar
 */
@Component({
    selector: 'tabs-with-scroll-example',
    templateUrl: 'tabs-with-scroll-example.html',
    styleUrls: ['tabs-with-scroll-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabsWithScrollExample {
    tabs: number[];

    constructor() {
        // tslint:disable-next-line:no-magic-numbers
        this.tabs = Array(20)
            .fill(null)
            .map((_, i) => i);
    }
}
