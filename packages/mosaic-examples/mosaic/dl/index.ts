import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McDlModule } from '@ptsecurity/mosaic/dl';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { DlHorizontalOverviewExample } from './dl-horizontal-overview/dl-horizontal-overview-example';
import { DlOverviewExample } from './dl-overview/dl-overview-example';
import { DlVerticalOverviewExample } from './dl-vertical-overview/dl-vertical-overview-example';


export {
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample
};

const EXAMPLES = [
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McDlModule,
        McLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    entryComponents: EXAMPLES
})
export class DlExamplesModule {}
