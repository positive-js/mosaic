import { Component } from '@angular/core';
import { ArrowPlacements } from '@ptsecurity/mosaic/tooltip';


/**
 * @title Basic tooltip with Arrow Placement
 */
@Component({
    selector: 'tooltip-arrow-placement-example',
    templateUrl: 'tooltip-arrow-placement-example.html',
    styleUrls: ['tooltip-arrow-placement-example.css']
})
export class TooltipArrowPlacementExample {

    arrowPosition = ArrowPlacements;
}
