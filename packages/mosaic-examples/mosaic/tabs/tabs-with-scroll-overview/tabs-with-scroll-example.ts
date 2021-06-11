import { Component } from '@angular/core';


/**
 * @title Navbar
 */
@Component({
    selector: 'tabs-with-scroll-example',
    templateUrl: 'tabs-with-scroll-example.html',
    styleUrls: ['tabs-with-scroll-example.css']
})
export class TabsWithScrollExample {
    tabs = ['First', 'Second', 'Third'];

    add() {
        this.tabs.push(`tab ${this.tabs.length}`);
    }

    remove() {
        const last = this.tabs.length;

        if (last < 1) { return; }

        this.tabs.splice(last - 1, 1);
    }
}
