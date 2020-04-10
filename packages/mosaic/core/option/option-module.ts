import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McPseudoCheckboxModule } from '../selection/index';

import { McOptgroup } from './optgroup';
import { McOption } from './option';


@NgModule({
    imports: [CommonModule, McPseudoCheckboxModule],
    exports: [McOption, McOptgroup],
    declarations: [McOption, McOptgroup]
})
export class McOptionModule {}
