import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import {
    McPopoverConfirmComponent,
    McPopoverConfirmTrigger,
    MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './popover-confirm.component';


@NgModule({
    declarations: [McPopoverConfirmComponent, McPopoverConfirmTrigger],
    exports: [McPopoverConfirmComponent, McPopoverConfirmTrigger],
    imports: [CommonModule, OverlayModule, McButtonModule],
    providers: [MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McPopoverConfirmComponent]
})
export class McPopoverConfirmModule {}
