import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McListModule } from '@ptsecurity/mosaic/list';

import { ListGroupsExample } from './list-groups/list-groups-example';
import { ListMultipleCheckboxExample } from './list-multiple-checkbox/list-multiple-checkbox-example';
import { ListMultipleKeyboardExample } from './list-multiple-keyboard/list-multiple-keyboard-example';
import { ListOverviewExample } from './list-overview/list-overview-example';


const EXAMPLES = [
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McListModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ListExamplesModule {}
