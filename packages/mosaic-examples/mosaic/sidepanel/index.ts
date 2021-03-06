import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSidepanelModule } from '@ptsecurity/mosaic/sidepanel';

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
        McSidepanelModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
