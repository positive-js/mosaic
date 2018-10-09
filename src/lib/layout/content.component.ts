import { Component } from '@angular/core';


@Component({
    selector: 'mc-content',
    preserveWhitespaces: false,
    templateUrl: './content.component.html',
    styles: [
        `:host {
            display: block;
        }`
    ],
    host: {
        '[class.mc-layout-content]': 'true'
    }
})
export class McContentComponent {
}
