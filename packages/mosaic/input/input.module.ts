import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McInput, McInputMono } from './input';
import { McNumberInput } from './input-number';
import { MaxValidator, MinValidator } from './input-number-validators';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule, FormsModule],
    exports: [McInput, McNumberInput, McInputMono, MinValidator, MaxValidator],
    declarations: [McInput, McNumberInput, McInputMono, MinValidator, MaxValidator ]
})
export class McInputModule {}
