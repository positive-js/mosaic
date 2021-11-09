import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Button's colors
 */
@Component({
    selector: 'button-colors-example',
    templateUrl: 'button-colors-example.html',
    styleUrls: ['button-colors-example.css']
})
export class ButtonColorsExample {
    themePalette = ThemePalette;
}
