import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McPseudoCheckbox } from './pseudo-checkbox';


@NgModule({
    imports: [CommonModule],
    exports: [McPseudoCheckbox],
    declarations: [McPseudoCheckbox]
})
export class McPseudoCheckboxModule {}
