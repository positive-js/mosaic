import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McPseudoCheckboxModule } from '../selection/index';

import { McOptionActionComponent } from './action';
import { McOptgroup } from './optgroup';
import { McOption } from './option';


@NgModule({
    imports: [CommonModule, McPseudoCheckboxModule],
    declarations: [McOption, McOptgroup, McOptionActionComponent],
    exports: [McOption, McOptgroup, McOptionActionComponent]
})
export class McOptionModule {}
