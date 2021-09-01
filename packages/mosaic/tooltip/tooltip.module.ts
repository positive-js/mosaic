import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McTooltipComponent,
    McTooltipTrigger,
    MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './tooltip.component';


@NgModule({
    declarations: [McTooltipComponent, McTooltipTrigger],
    exports: [McTooltipComponent, McTooltipTrigger],
    imports: [CommonModule, OverlayModule],
    providers: [MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McTooltipComponent]
})
export class McToolTipModule {}
