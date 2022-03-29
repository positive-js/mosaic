import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McDlModule } from '@ptsecurity/mosaic/dl';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { DlOverviewExample } from './dl-overview/dl-overview-example';


export {
    DlOverviewExample
};

const EXAMPLES = [
    DlOverviewExample
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
export class DlExamplesModule {
}
