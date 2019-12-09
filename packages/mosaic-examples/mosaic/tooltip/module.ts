import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';


const EXAMPLES = [
    TooltipOverviewExample
];

@NgModule({
    imports: [
        BrowserAnimationsModule,
        A11yModule,
        McButtonModule,
        McToolTipModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
