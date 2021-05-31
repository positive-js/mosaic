import { Component } from '@angular/core';


@Component({
    selector: 'mc-cleaner',
    exportAs: 'mcCleaner',
    template: `<i class="mc-icon_light" mc-icon="mc-close-circle_16" [color]="'primary'"></i>`,
    host: {
        class: 'mc-cleaner'
    }
})
export class McCleaner {}
