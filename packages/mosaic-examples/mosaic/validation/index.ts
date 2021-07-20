import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormsModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { ValidationCompositeExample } from './validation-composite/validation-composite-example';
import { ValidationGlobalExample } from './validation-global/validation-global-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOverviewExample } from './validation-overview/validation-overview-example';
import { ValidationSmallExample } from './validation-small/validation-small-example';


export {
    ValidationOverviewExample,
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationSmallExample
};

const EXAMPLES = [
    ValidationOverviewExample,
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationSmallExample
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        McInputModule,
        McFormFieldModule,
        McFormsModule,
        McToolTipModule,
        McSelectModule,
        McIconModule,
        McButtonModule,
        McTextareaModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}
