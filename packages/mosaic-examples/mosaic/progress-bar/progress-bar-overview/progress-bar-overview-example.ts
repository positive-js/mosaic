import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Basic progress bar
 */
@Component({
    selector: 'progress-bar-overview-example',
    templateUrl: 'progress-bar-overview-example.html',
    styleUrls: ['progress-bar-overview-example.css']
})
export class ProgressBarOverviewExample {
    themePalette = ThemePalette;

    percent: number = 30;
}
