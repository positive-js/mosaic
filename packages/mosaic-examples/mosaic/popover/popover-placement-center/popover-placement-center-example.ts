import { Component } from '@angular/core';
import { PopUpPlacements, ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title popover-placement-center
 */
@Component({
    selector: 'popover-placement-center-example',
    templateUrl: 'popover-placement-center-example.html',
    styleUrls: ['popover-placement-center-example.css']
})
export class PopoverPlacementCenterExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left];
    activePlacement: PopUpPlacements | null;

    themePalette = ThemePalette;
}
