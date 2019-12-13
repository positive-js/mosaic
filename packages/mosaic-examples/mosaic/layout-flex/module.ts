import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McSelectModule } from '@ptsecurity/mosaic/select';

import { LayoutFlexAlignmentExample } from './layout-flex-alignment/layout-flex-alignment-example';
import {
    LayoutFlexBehaviourModifiersExample
} from './layout-flex-behaviour-modifiers/layout-flex-behaviour-modifiers-example';
import { LayoutFlexOffsetsExample } from './layout-flex-offsets/layout-flex-offsets-example';
import { LayoutFlexOrderExample } from './layout-flex-order/layout-flex-order-example';
import { LayoutFlexOverviewExample } from './layout-flex-overview/layout-flex-overview-example';


const EXAMPLES = [
    LayoutFlexOverviewExample,
    LayoutFlexAlignmentExample,
    LayoutFlexBehaviourModifiersExample,
    LayoutFlexOffsetsExample,
    LayoutFlexOrderExample
];

@NgModule({
    imports: [
        FormsModule,
        BrowserAnimationsModule,
        McButtonModule,
        McRadioModule,
        McSelectModule,
        McFormFieldModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class FlexLayoutExamplesModule {}
