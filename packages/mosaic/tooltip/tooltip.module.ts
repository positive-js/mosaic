import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McTooltipComponent,
    McTooltipTrigger,
    McExtendedTooltipTrigger,
    McWarningTooltipTrigger,
    MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
    MC_TOOLTIP_OPEN_TIME_PROVIDER
} from './tooltip.component';


@NgModule({
    declarations: [
        McTooltipComponent,
        McTooltipTrigger,
        McExtendedTooltipTrigger,
        McWarningTooltipTrigger
    ],
    exports: [
        McTooltipComponent,
        McTooltipTrigger,
        McExtendedTooltipTrigger,
        McWarningTooltipTrigger
    ],
    imports: [CommonModule, OverlayModule],
    providers: [
        MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
        MC_TOOLTIP_OPEN_TIME_PROVIDER
    ],
    entryComponents: [McTooltipComponent]
})
export class McToolTipModule {}
