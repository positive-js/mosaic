import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Indeterminate progress bar
 */
@Component({
    selector: 'progress-bar-indeterminate-example',
    templateUrl: 'progress-bar-indeterminate-example.html',
    styleUrls: ['progress-bar-indeterminate-example.css']
})
export class ProgressBarIndeterminateExample {
    themePalette = ThemePalette;
}
