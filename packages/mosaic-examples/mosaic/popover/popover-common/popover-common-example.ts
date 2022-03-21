import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title popover-common
 */
@Component({
    selector: 'popover-common-example',
    templateUrl: 'popover-common-example.html',
    styleUrls: ['popover-common-example.css']
})
export class PopoverCommonExample {
    themePalette = ThemePalette;
}
