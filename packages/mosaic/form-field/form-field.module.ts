import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McCleaner } from './cleaner';
import { McFormField, McFormFieldWithoutBorders } from './form-field';
import { McHint } from './hint';
import { McPrefix } from './prefix';
import { McStepper } from './stepper';
import { McSuffix } from './suffix';


@NgModule({
    declarations: [
        McFormField,
        McFormFieldWithoutBorders,
        McHint,
        McPrefix,
        McSuffix,
        McCleaner,
        McStepper
    ],
    imports: [CommonModule, McIconModule],
    exports: [
        McFormField,
        McFormFieldWithoutBorders,
        McHint,
        McPrefix,
        McSuffix,
        McCleaner,
        McStepper
    ]
})
export class McFormFieldModule {
}
