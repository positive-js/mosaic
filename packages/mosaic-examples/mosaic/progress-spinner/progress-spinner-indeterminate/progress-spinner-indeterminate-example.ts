import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Indeterminate progress spinner
 */
@Component({
    selector: 'progress-spinner-indeterminate-example',
    templateUrl: 'progress-spinner-indeterminate-example.html',
    styleUrls: ['progress-spinner-indeterminate-example.css']
})
export class ProgressSpinnerIndeterminateExample {
    themePalette = ThemePalette;
}
