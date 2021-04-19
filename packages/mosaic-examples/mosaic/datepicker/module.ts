import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { DatepickerCustomExample } from './datepicker-custom/datepicker-custom-example';
import { DatepickerDisabledExample } from './datepicker-disabled/datepicker-disabled-example';
import { DatepickerLanguageExample } from './datepicker-language/datepicker-language-example';
import { DatepickerOverviewExample } from './datepicker-overview/datepicker-overview-example';
import { DatepickerYearExample } from './datepicker-year/datepicker-year-example';


const EXAMPLES = [
    DatepickerDisabledExample,
    DatepickerLanguageExample,
    DatepickerOverviewExample,
    DatepickerYearExample,
    DatepickerCustomExample
];



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        McMomentDateModule,
        McDatepickerModule,
        McInputModule,
        McFormFieldModule,
        McIconModule,
        McRadioModule,
        McToolTipModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DatepickerExamplesModule {
}
