import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipScrollableExample } from './tooltip-scrollable/tooltip-scrollable-example';


export {
    TooltipOverviewExample,
    TooltipScrollableExample
};

const EXAMPLES = [
    TooltipOverviewExample,
    TooltipScrollableExample
];

@NgModule({
    imports: [
        A11yModule,
        McButtonModule,
        McToolTipModule,
        CdkScrollableModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
