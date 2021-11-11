import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Progress button
 */
@Component({
    selector: 'button-progress-example',
    templateUrl: 'button-progress-example.html',
    styleUrls: ['button-progress-example.css']
})
export class ButtonProgressExample {
    themePalette = ThemePalette;
}
