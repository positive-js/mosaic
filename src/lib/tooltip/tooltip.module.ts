import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@ptsecurity/cdk/overlay';

import {
    McToolTipComponent,
    McTooltipDirective,
    MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './tooltip.component';


@NgModule({
    declarations: [ McToolTipComponent, McTooltipDirective ],
    exports: [ McToolTipComponent, McTooltipDirective ],
    imports: [ BrowserAnimationsModule, CommonModule, OverlayModule ],
    providers: [MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
    entryComponents: [ McToolTipComponent ]
})
export class McToolTipModule {
}
