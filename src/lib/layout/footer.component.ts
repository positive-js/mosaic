import { Component } from '@angular/core';


@Component({
    selector: 'mc-footer',
    preserveWhitespaces: false,
    templateUrl: './footer.component.html',
    styles: [
        `:host {
            display: block;
        }`
    ],
    host: {
        '[class.mc-layout-footer]': 'true'
    }
})
export class McFooterComponent {
}
