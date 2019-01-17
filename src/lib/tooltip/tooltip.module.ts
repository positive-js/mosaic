import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';

import {
    McTooltipComponent,
    McTooltip,
    MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './tooltip.component';


@NgModule({
    declarations: [McTooltipComponent, McTooltip],
    exports: [McTooltipComponent, McTooltip],
    imports: [CommonModule, OverlayModule],
    providers: [MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [McTooltipComponent]
})
export class McToolTipModule {
}
