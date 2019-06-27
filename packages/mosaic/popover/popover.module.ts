import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McPopoverComponent,
    McPopover,
    MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './popover.component';


@NgModule({
    declarations: [McPopoverComponent, McPopover],
    exports: [McPopoverComponent, McPopover],
    imports: [CommonModule, OverlayModule],
    providers: [MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McPopoverComponent]
})
export class McPopoverModule {}
