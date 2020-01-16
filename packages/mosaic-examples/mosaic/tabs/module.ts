import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McTabsModule } from '@ptsecurity/mosaic/tabs';

import { TabsLightExample } from './tabs-light-overview/tabs-light-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch-overview/tabs-stretch-example';


const EXAMPLES = [
    TabsOverviewExample,
    TabsLightExample,
    TabsStretchExample
];

@NgModule({
    imports: [
        BrowserModule,
        McTabsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
