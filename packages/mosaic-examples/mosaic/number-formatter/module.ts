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


@NgModule({
    imports: [
        CommonModule,
        McFormattersModule,
        McInputModule,
        McFormFieldModule,
        FormsModule
    ],
    declarations: [NumberFormatterOverviewExample, WithDefaultLocaleComponent, WithENLocaleComponent],
    exports: [NumberFormatterOverviewExample, WithDefaultLocaleComponent, WithENLocaleComponent]
})
export class NumberFormatterExamplesModule {}
