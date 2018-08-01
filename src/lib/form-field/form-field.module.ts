import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McCleaner } from './cleaner';
import { McFormField } from './form-field';
import { McHint } from './hint';
import { McPrefix } from './prefix';
import { McSuffix } from './suffix';


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
