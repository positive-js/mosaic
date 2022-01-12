import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { McPopoverConfirmComponent, McPopoverConfirmTrigger } from './popover-confirm.component';
import { MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER, McPopoverComponent, McPopoverTrigger } from './popover.component';


@NgModule({
    declarations: [McPopoverComponent, McPopoverTrigger, McPopoverConfirmComponent, McPopoverConfirmTrigger],
    exports: [McPopoverComponent, McPopoverTrigger, McPopoverConfirmComponent, McPopoverConfirmTrigger],
    imports: [CommonModule, OverlayModule, McButtonModule, A11yModule],
    providers: [MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McPopoverComponent, McPopoverConfirmComponent]
})
export class McPopoverModule {}
