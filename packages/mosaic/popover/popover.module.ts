import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import {
    McPopoverComponent,
    McPopoverTrigger,
    MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './popover.component';

import { 
    McPopoverConfirmComponent,
    McPopoverConfirmTrigger
} from './popover-confirm.component';

@NgModule({
    declarations: [McPopoverComponent, McPopoverTrigger, McPopoverConfirmComponent, McPopoverConfirmTrigger],
    exports: [McPopoverComponent, McPopoverTrigger, McPopoverConfirmComponent, McPopoverConfirmTrigger],
    imports: [CommonModule, OverlayModule, McButtonModule],
    providers: [MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McPopoverComponent, McPopoverConfirmComponent]
})
export class McPopoverModule {}
