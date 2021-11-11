import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Basic Input
 */
@Component({
    selector: 'input-overview-example',
    templateUrl: 'input-overview-example.html',
    styleUrls: ['input-overview-example.css']
})
export class InputOverviewExample {
    themePalette = ThemePalette;
    value = '';
}
