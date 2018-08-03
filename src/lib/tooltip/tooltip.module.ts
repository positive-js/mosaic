import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@ptsecurity/cdk/overlay';

import { McToolTipComponent, McTooltipDirective } from './tooltip.component';


@NgModule({
    declarations   : [ McToolTipComponent, McTooltipDirective ],
    exports        : [ McToolTipComponent, McTooltipDirective ],
    imports        : [ BrowserAnimationsModule, CommonModule, OverlayModule ],
    entryComponents: [ McToolTipComponent ]
})
export class McToolTipModule {
}
