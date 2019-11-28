import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';

import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';


const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McTreeModule,
        CdkTreeModule,
        McTreeSelectModule,
        McInputModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
