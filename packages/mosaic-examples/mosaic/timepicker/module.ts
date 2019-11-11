import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';

import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';


const EXAMPLES = [
    TimepickerOverviewExample
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
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {
}
