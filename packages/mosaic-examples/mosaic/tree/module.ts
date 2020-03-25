import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McHighlightModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { TreeFilteringExample } from './tree-filtering/tree-filtering-example';
import { TreeMultipleCheckboxExample } from './tree-multiple-checkbox/tree-multiple-checkbox-example';
import {
    TreeMultipleChecklistExample
} from './tree-multiple-checklist/tree-multiple-checklist-example';
import { TreeMultipleKeyboardExample } from './tree-multiple-keyboard/tree-multiple-keyboard-example';
import { TreeOverviewExample } from './tree-overview/tree-overview-example';


const EXAMPLES = [
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
        McCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeExamplesModule {}
