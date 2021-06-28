import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        McButtonModule,
        McIconModule,
        McSidepanelModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
