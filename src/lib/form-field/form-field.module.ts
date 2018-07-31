import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McFormField } from './form-field';
import { McHint } from './hint';
import { McSuffix } from './suffix';
import { McPrefix } from './prefix';
import { McCleaner } from './cleaner';


@NgModule({
    declarations: [
        McFormField,
        McHint,
        McPrefix,
        McSuffix,
        McCleaner
    ],
    imports: [CommonModule, McIconModule],
    exports: [
        McFormField,
        McHint,
        McPrefix,
        McSuffix,
        McCleaner
    ]
})
export class McFormFieldModule {
}
