import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormsModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';

import { HorizontalFormExample } from './horizontal-form/horizontal-form-example';
import { VerticalFormExample } from './vertical-form/vertical-form-example';


export {
    HorizontalFormExample,
    VerticalFormExample
};

const EXAMPLES = [
    HorizontalFormExample,
    VerticalFormExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McInputModule,
        McFormFieldModule,
        McFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class FormsExamplesModule {}
