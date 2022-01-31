import { Component, ViewChild } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McPopoverTrigger } from '@ptsecurity/mosaic/popover';


/**
 * @title popover-instance
 */
@Component({
    selector: 'popover-instance-example',
    templateUrl: 'popover-instance-example.html',
    styleUrls: ['popover-instance-example.css']
})
export class PopoverInstanceExample {
    @ViewChild('popover', { static: false }) popover: McPopoverTrigger;

    themePalette = ThemePalette;

    togglePopover($event) {
        $event.stopPropagation();

        if (this.popover.isOpen) {
            this.popover.hide();
        } else {
            this.popover.show();
        }
    }
}
