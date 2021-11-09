import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McHighlightModule, McOptionModule } from '@ptsecurity/mosaic/core';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { TreeActionButtonExample } from './tree-action-button/tree-action-button-example';
import { TreeFilteringExample } from './tree-filtering/tree-filtering-example';
import { TreeMultipleCheckboxExample } from './tree-multiple-checkbox/tree-multiple-checkbox-example';
import {
    TreeMultipleChecklistExample
} from './tree-multiple-checklist/tree-multiple-checklist-example';
import { TreeMultipleKeyboardExample } from './tree-multiple-keyboard/tree-multiple-keyboard-example';
import { TreeOverviewExample } from './tree-overview/tree-overview-example';


export {
    TreeActionButtonExample,
    TreeOverviewExample,
    TreeMultipleCheckboxExample,
    TreeMultipleChecklistExample,
    TreeMultipleKeyboardExample,
    TreeFilteringExample
};

const EXAMPLES = [
    TreeActionButtonExample,
    TreeOverviewExample,
    TreeMultipleCheckboxExample,
    TreeMultipleChecklistExample,
    TreeMultipleKeyboardExample,
    TreeFilteringExample
];

@NgModule({
    imports: [
        FormsModule,
        McFormFieldModule,
        McInputModule,
        McTreeModule,
        McIconModule,
        McHighlightModule,
        McCheckboxModule,
        McDropdownModule,
        McToolTipModule,
        McOptionModule,
        ClipboardModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeExamplesModule {}
