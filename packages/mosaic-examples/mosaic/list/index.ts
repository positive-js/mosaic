import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { ListActionButtonExample } from './list-action-button/list-action-button-example';
import { ListGroupsExample } from './list-groups/list-groups-example';
import { ListMultipleCheckboxExample } from './list-multiple-checkbox/list-multiple-checkbox-example';
import { ListMultipleKeyboardExample } from './list-multiple-keyboard/list-multiple-keyboard-example';
import { ListOverviewExample } from './list-overview/list-overview-example';


export {
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample,
    ListActionButtonExample
};

const EXAMPLES = [
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample,
    ListActionButtonExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McListModule,
        McDropdownModule,
        McToolTipModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ListExamplesModule {}
