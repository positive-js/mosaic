import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTabsModule } from '@ptsecurity/mosaic/tabs';

import { TabsEmptyExample } from './tabs-empty-overview/tabs-empty-example';
import { TabsOldExample } from './tabs-old-overview/tabs-old-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch-overview/tabs-stretch-example';
import { TabsVerticalExample } from './tabs-vertical-overview/tabs-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll-overview/tabs-with-scroll-example';


const EXAMPLES = [
    TabsOverviewExample,
    TabsOldExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsWithScrollExample,
    TabsEmptyExample
];

@NgModule({
    imports: [
        BrowserModule,
        McTabsModule,
        McIconModule,
        McButtonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
