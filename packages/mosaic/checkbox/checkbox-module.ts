import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McCheckbox } from './checkbox';
import { McCheckboxRequiredValidator } from './checkbox-required-validator';


@NgModule({
    imports: [CommonModule],
    exports: [McCheckbox, McCheckboxRequiredValidator],
    declarations: [McCheckbox, McCheckboxRequiredValidator]
})
export class McCheckboxModule {
}
