import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Description List
 */
@Component({
    selector: 'dl-overview-example',
    templateUrl: 'dl-overview-example.html',
    styleUrls: ['dl-overview-example.css']
})
export class DlOverviewExample {
    themePalette = ThemePalette;
}
