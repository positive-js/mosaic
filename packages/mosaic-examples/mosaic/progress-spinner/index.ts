import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McProgressSpinnerModule } from '@ptsecurity/mosaic/progress-spinner';

import { ProgressSpinnerIndeterminateExample } from './progress-spinner-indeterminate/progress-spinner-indeterminate-example';
import { ProgressSpinnerOverviewExample } from './progress-spinner-overview/progress-spinner-overview-example';


export {
    ProgressSpinnerIndeterminateExample,
    ProgressSpinnerOverviewExample
};

const EXAMPLES = [
    ProgressSpinnerIndeterminateExample,
    ProgressSpinnerOverviewExample
];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McFormFieldModule,
        McProgressSpinnerModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class  ProgressSpinnerExamplesModule {}
