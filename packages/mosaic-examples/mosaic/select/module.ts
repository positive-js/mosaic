import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';

import { SelectMultipleOverviewExample } from './select-multiple-overview/select-multiple-overview-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectSearchOverviewExample } from './select-search-overview/select-search-overview-example';


const EXAMPLES = [
    SelectOverviewExample,
    SelectMultipleOverviewExample,
    SelectSearchOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McSelectModule,
        McInputModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
