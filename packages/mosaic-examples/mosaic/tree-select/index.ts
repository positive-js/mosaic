import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McProgressSpinnerModule } from '@ptsecurity/mosaic/progress-spinner';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';

import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';


export {
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectLazyloadExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectLazyloadExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McTreeModule,
        McTreeSelectModule,
        McInputModule,
        McIconModule,
        McProgressSpinnerModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
