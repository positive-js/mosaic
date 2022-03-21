import { Component, ViewChild } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McPopoverTrigger } from '@ptsecurity/mosaic/popover';


/**
 * @title popover-scroll
 */
@Component({
    selector: 'popover-scroll-example',
    templateUrl: 'popover-scroll-example.html',
    styleUrls: ['popover-scroll-example.css']
})
export class PopoverScrollExample {
    @ViewChild('popover', { static: false }) popover: McPopoverTrigger;

    themePalette = ThemePalette;

    closeOnScroll: boolean;
}
