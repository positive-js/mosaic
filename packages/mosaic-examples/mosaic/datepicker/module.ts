import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

import { DatepickerDisabledExample } from './datepicker-disabled/datepicker-disabled-example';
import { DatepickerOverviewExample } from './datepicker-overview/datepicker-overview-example';


const EXAMPLES = [
    DatepickerDisabledExample,
    DatepickerOverviewExample
];



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McMomentDateModule,
        McDatepickerModule,
        McInputModule,
        McFormFieldModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DatepickerExamplesModule {
}
