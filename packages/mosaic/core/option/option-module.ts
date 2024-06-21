import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { McPseudoCheckboxModule } from '../selection/index';

import { McOptionActionComponent } from './action';
import { McOptgroup } from './optgroup';
import { McOption } from './option';


@NgModule({
    imports: [CommonModule, McPseudoCheckboxModule, McToolTipModule],
    declarations: [McOption, McOptgroup, McOptionActionComponent],
    exports: [McOption, McOptgroup, McOptionActionComponent]
})
export class McOptionModule {}
