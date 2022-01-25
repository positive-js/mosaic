import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@ptsecurity/mosaic/core';


/**
 * @title Tooltip placement
 */
@Component({
    selector: 'tooltip-placement-example',
    templateUrl: 'tooltip-placement-example.html',
    styleUrls: ['tooltip-placement-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipPlacementExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left,
        PopUpPlacements.LeftTop, PopUpPlacements.RightTop];
}
