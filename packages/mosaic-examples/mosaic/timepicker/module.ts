import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';

import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';
import { TimepickerRangeExample } from './timepicker-range/timepicker-range-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';
import { TimepickerValidationSymbolsExample } from "./timepicker-validation-symbols/timepicker-validation-symbols-example";


const EXAMPLES = [
    TimepickerOverviewExample,
    TimepickerRangeExample,
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample
];



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McMomentDateModule,
        McCheckboxModule,
        McSelectModule,
        McTimepickerModule,
        McInputModule,
        McFormFieldModule,
        McIconModule,
        McRadioModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {
}
