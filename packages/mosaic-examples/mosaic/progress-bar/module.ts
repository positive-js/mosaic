import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McProgressBarModule } from '@ptsecurity/mosaic/progress-bar';

import { ProgressBarIndeterminateExample } from './progress-bar-indeterminate/progress-bar-indeterminate-example';
import { ProgressBarOverviewExample } from './progress-bar-overview/progress-bar-overview-example';


const EXAMPLES = [
    ProgressBarIndeterminateExample,
    ProgressBarOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McFormFieldModule,
        McInputModule,
        McProgressBarModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ProgressBarExamplesModule {}
