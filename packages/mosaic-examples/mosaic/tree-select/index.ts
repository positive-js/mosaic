import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McHighlightModule, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McProgressSpinnerModule } from '@ptsecurity/mosaic/progress-spinner';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';

import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';


export {
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McTreeModule,
        McSelectModule,
        McHighlightModule,
        McTreeSelectModule,
        McInputModule,
        McIconModule,
        McProgressSpinnerModule,
        McPseudoCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
