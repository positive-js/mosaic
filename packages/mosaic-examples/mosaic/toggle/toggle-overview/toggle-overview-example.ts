import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Basic toggle
 */
@Component({
    selector: 'toggle-overview-example',
    templateUrl: 'toggle-overview-example.html',
    styleUrls: ['toggle-overview-example.css']
})
export class ToggleOverviewExample {
    themePalette = ThemePalette;

    value: boolean = true;
}
