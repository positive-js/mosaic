import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McTooltipComponent,
    McTooltipTrigger,
    MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER, McExtendedTooltipTrigger
} from './tooltip.component';


@NgModule({
    declarations: [McTooltipComponent, McTooltipTrigger, McExtendedTooltipTrigger],
    exports: [McTooltipComponent, McTooltipTrigger, McExtendedTooltipTrigger],
    imports: [CommonModule, OverlayModule],
    providers: [MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McTooltipComponent]
})
export class McToolTipModule {}
