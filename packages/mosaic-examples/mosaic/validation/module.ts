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
    ValidationCompositeOverviewExample
} from './validation-composite-overview/validation-composite-overview-example';
import {
    ValidationGlobalOverviewExample
} from './validation-global-overview/validation-global-overview-example';
import { ValidationOnBlurOverviewExample } from './validation-on-blur-overview/validation-on-blur-overview-example';
import { ValidationOnTypeOverviewExample } from './validation-on-type-overview/validation-on-type-overview-example';
import {
    ValidationOverviewExample
} from './validation-overview/validation-overview-example';
import { ValidationSmallOverviewExample } from './validation-small-overview/validation-small-overview-example';


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
    declarations: [
        ValidationOverviewExample,
        ValidationCompositeOverviewExample,
        ValidationGlobalOverviewExample,
        ValidationOnBlurOverviewExample,
        ValidationOnTypeOverviewExample,
        ValidationSmallOverviewExample
    ],
    exports: [
        ValidationOverviewExample,
        ValidationCompositeOverviewExample,
        ValidationGlobalOverviewExample,
        ValidationOnBlurOverviewExample,
        ValidationOnTypeOverviewExample,
        ValidationSmallOverviewExample
    ]
})
export class ValidationExamplesModule {}
