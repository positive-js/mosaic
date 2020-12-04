import { Component, ViewChild } from '@angular/core';
import { McPopover } from '@ptsecurity/mosaic/popover';


/**
 * @title popover-instance
 */
@Component({
    selector: 'popover-instance-example',
    templateUrl: 'popover-instance-example.html',
    styleUrls: ['popover-instance-example.css']
})
export class PopoverInstanceExample {
    @ViewChild('popover', { static: false }) popover: McPopover;

    togglePopover($event) {
        $event.stopPropagation();

        console.log('togglePopover');
        if (this.popover.isOpen) {
            this.popover.hide();
        } else {
            this.popover.show();
        }
    }
}
