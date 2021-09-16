import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormsModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';
import { McSelectModule } from '@ptsecurity/mosaic/select';
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
        CommonModule,
        A11yModule,
        McButtonModule,
        McToolTipModule,
        CdkScrollableModule,
        FormsModule,
        McFormsModule,
        McFormFieldModule,
        McSelectModule,
        McPopoverModule,
        McIconModule,
        McInputModule,
        McCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
