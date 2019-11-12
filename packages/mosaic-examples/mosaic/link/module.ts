import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { LinkOverviewExample } from './link-overview/link-overview-example';
import { LinkPseudoExample } from './link-pseudo/link-pseudo-example';


const EXAMPLES = [
    LinkOverviewExample,
    LinkPseudoExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McIconModule,
        McLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class LinkExamplesModule {
}
