import { A11yModule } from '@angular/cdk/a11y';
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

import { PopoverCommonExample } from './popover-common/popover-common-example';
import { PopoverInstanceExample } from './popover-instance/popover-instance-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';


export {
    PopoverCommonExample,
    PopoverInstanceExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample
};

const EXAMPLES = [
    PopoverCommonExample,
    PopoverInstanceExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        FormsModule,
        McFormsModule,
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
