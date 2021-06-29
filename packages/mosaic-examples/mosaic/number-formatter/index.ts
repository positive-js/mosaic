import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormattersModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';

import {
    NumberFormatterOverviewExample,
    WithDefaultLocaleComponent,
    WithENLocaleComponent
} from './number-formatter-overview/number-formatter-overview-example';


export {
    NumberFormatterOverviewExample,
    WithDefaultLocaleComponent,
    WithENLocaleComponent
};

const EXAMPLES = [
    NumberFormatterOverviewExample,
    WithDefaultLocaleComponent,
    WithENLocaleComponent
];

@NgModule({
    imports: [
        CommonModule,
        McFormattersModule,
        McInputModule,
        McFormFieldModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NumberFormatterExamplesModule {}
