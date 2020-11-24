import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import {
    ValidationOverviewExample
} from './validation-overview/validation-overview-example';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        McInputModule,
        McFormFieldModule,
        McToolTipModule,
        McSelectModule,
        McIconModule,
        McButtonModule,
        McTextareaModule
    ],
    declarations: [ValidationOverviewExample],
    exports: [ValidationOverviewExample]
})
export class ValidationExamplesModule {}
