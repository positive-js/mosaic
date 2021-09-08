import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';
import { McSelectModule } from '@ptsecurity/mosaic/select';

import { PopoverInstanceExample } from './popover-instance/popover-instance-example';
import { PopoverOverviewExample } from './popover-overview/popover-overview-example';


export {
    PopoverOverviewExample,
    PopoverInstanceExample
};

const EXAMPLES = [
    PopoverOverviewExample,
    PopoverInstanceExample
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        FormsModule,
        McFormFieldModule,
        McSelectModule,
        McPopoverModule,
        McButtonModule,
        McIconModule,
        McInputModule,
        McCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
