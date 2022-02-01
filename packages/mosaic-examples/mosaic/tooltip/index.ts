import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';


export {
    TooltipOverviewExample,
    TooltipExtendedExample
};

const EXAMPLES = [
    TooltipOverviewExample,
    TooltipExtendedExample
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
