import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';
import { TimepickerRangeExample } from './timepicker-range/timepicker-range-example';


const EXAMPLES = [
    TimepickerOverviewExample,
    TimepickerRangeExample
];



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McMomentDateModule,
        McToolTipModule,
        McCheckboxModule,
        McSelectModule,
        McTimepickerModule,
        McInputModule,
        McFormFieldModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {
}
