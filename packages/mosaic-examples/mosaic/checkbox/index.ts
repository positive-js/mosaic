import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';
import { PseudoCheckboxExample } from './pseudo-checkbox/pseudo-checkbox-example';


export {
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
};

const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
];

@NgModule({
    imports: [
        CommonModule,
        McCheckboxModule,
        McPseudoCheckboxModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {
}
