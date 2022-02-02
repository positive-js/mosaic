import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipMultipleLinesExample } from './tooltip-multiple-lines/tooltip-multiple-lines-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipPlacementExample } from './tooltip-placement/tooltip-placement-example';


export {
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipMultipleLinesExample,
    TooltipPlacementExample
};

const EXAMPLES = [
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipMultipleLinesExample,
    TooltipPlacementExample
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        McButtonModule,
        McToolTipModule,
        CdkScrollableModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
