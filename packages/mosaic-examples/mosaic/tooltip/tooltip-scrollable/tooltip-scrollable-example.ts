import { Component, ViewChild } from '@angular/core';
import { McTooltipTrigger } from '@ptsecurity/mosaic/tooltip';


/**
 * @title Basic scrollable tooltip
 */
@Component({
    selector: 'tooltip-scrollable-example',
    templateUrl: 'tooltip-scrollable-example.html',
    styleUrls: ['tooltip-scrollable-example.css']
})
export class TooltipScrollableExample {
    @ViewChild(McTooltipTrigger, { static: false }) tooltip: McTooltipTrigger;

    toggleTooltip(flag) {
        if (!flag) {
            this.tooltip.show();
        } else {
            this.tooltip.hide();
        }
    }
}
