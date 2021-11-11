import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Basic tags
 */
@Component({
    selector: 'tags-overview-example',
    templateUrl: 'tags-overview-example.html',
    styleUrls: ['tags-overview-example.css']
})
export class TagsOverviewExample {
    themePalette = ThemePalette;
}
