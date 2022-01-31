import { Component } from '@angular/core';
import { PopUpPlacements, ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title popover-placement-edges
 */
@Component({
    selector: 'popover-placement-edges-example',
    templateUrl: 'popover-placement-edges-example.html',
    styleUrls: ['popover-placement-edges-example.css']
})
export class PopoverPlacementEdgesExample {
    placements = [PopUpPlacements.TopLeft, PopUpPlacements.TopRight, PopUpPlacements.BottomLeft, PopUpPlacements.BottomRight,
        PopUpPlacements.LeftBottom, PopUpPlacements.LeftTop, PopUpPlacements.RightBottom, PopUpPlacements.RightTop];
    activePlacement: PopUpPlacements | null;

    themePalette = ThemePalette;
}
