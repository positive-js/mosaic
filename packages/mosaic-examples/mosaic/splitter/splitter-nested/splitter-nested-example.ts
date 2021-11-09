import { Component } from '@angular/core';
import { Direction } from '@ptsecurity/mosaic/splitter';


/**
 * @title Basic Splitter
 */
@Component({
    selector: 'splitter-nested-example',
    templateUrl: 'splitter-nested-example.html',
    styleUrls: ['splitter-nested-example.css']
})
export class SplitterNestedExample {
    direction = Direction;
}
