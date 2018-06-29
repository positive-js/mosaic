import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McCheckbox } from './checkbox';
import { McCheckboxRequiredValidator } from './checkbox-required-validator';


@NgModule({
    imports: [CommonModule, McCommonModule],
    exports: [McCheckbox, McCheckboxRequiredValidator, McCommonModule],
    declarations: [McCheckbox, McCheckboxRequiredValidator]
})
export class McCheckboxModule {
}
