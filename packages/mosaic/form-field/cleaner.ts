import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


@Component({
    selector: 'mc-cleaner',
    exportAs: 'mcCleaner',
    template: `<i class="mc-icon_light" mc-icon="mc-close-circle_16" [color]="themePalette.Second"></i>`,
    host: {
        class: 'mc-cleaner'
    }
})
export class McCleaner {
    themePalette = ThemePalette;
}
