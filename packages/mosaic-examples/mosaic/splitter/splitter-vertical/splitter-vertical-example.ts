import { Component } from '@angular/core';
import { Direction } from '@ptsecurity/mosaic/splitter';


/**
 * @title Basic Splitter
 */
@Component({
    selector: 'splitter-vertical-example',
    templateUrl: 'splitter-vertical-example.html',
    styleUrls: ['splitter-vertical-example.css']
})
export class SplitterVerticalExample {
    direction = Direction;
}
