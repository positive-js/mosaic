import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@ptsecurity/mosaic/core';


/**
 * @title Multiple lines tooltip
 */
@Component({
    selector: 'tooltip-multiple-lines-example',
    templateUrl: 'tooltip-multiple-lines-example.html',
    styleUrls: ['tooltip-multiple-lines-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipMultipleLinesExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
