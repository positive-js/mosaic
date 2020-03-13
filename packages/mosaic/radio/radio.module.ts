import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McRadioButton, McRadioGroup } from './radio.component';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule],
    exports: [McRadioGroup, McRadioButton],
    declarations: [McRadioGroup, McRadioButton]
})
export class McRadioModule {
}
