import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';

import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';


const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McCheckboxModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {
}
