import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McRadioModule } from '@ptsecurity/mosaic/radio';

import { DatepickerCustomExample } from './datepicker-custom/datepicker-custom-example';
import { DatepickerDisabledExample } from './datepicker-disabled/datepicker-disabled-example';
import { DatepickerLanguageExample } from './datepicker-language/datepicker-language-example';
import { DatepickerOverviewExample } from './datepicker-overview/datepicker-overview-example';
import { DatepickerToggleExample } from './datepicker-toggle/datepicker-toggle-example';
import { DatepickerYearExample } from './datepicker-year/datepicker-year-example';


const EXAMPLES = [
    DatepickerDisabledExample,
    DatepickerLanguageExample,
    DatepickerOverviewExample,
    DatepickerToggleExample,
    DatepickerYearExample,
    DatepickerCustomExample
];



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McMomentDateModule,
        McDatepickerModule,
        McInputModule,
        McFormFieldModule,
        McIconModule,
        McRadioModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DatepickerExamplesModule {
}
