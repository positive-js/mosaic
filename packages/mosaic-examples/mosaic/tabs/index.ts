import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTabsModule } from '@ptsecurity/mosaic/tabs';

import { TabsEmptyExample } from './tabs-empty/tabs-empty-example';
import { TabsOldExample } from './tabs-old/tabs-old-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch/tabs-stretch-example';
import { TabsVerticalExample } from './tabs-vertical/tabs-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll/tabs-with-scroll-example';


export {
    TabsOverviewExample,
    TabsOldExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsWithScrollExample,
    TabsEmptyExample
};

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
        CommonModule,
        McTabsModule,
        McIconModule,
        McButtonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
