import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McSidepanelModule } from '@ptsecurity/mosaic/sidepanel';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';

import { SidepanelComponentExample, SidepanelExampleCustomComponent } from './sidepanel-component/sidepanel-component-example';
import { SidepanelOverviewExample } from './sidepanel-overview/sidepanel-overview-example';


export {
    SidepanelOverviewExample,
    SidepanelComponentExample,
    SidepanelExampleCustomComponent
};

const EXAMPLES = [
    SidepanelOverviewExample,
    SidepanelComponentExample,
    SidepanelExampleCustomComponent
];

@NgModule({
    imports: [
        CommonModule,
        McButtonModule,
        McIconModule,
        McSidepanelModule,
        McFormFieldModule,
        McSelectModule,
        McToggleModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
