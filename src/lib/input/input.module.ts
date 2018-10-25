import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McInput, McInputMono, McNumberInput } from './input';
import { MaxValidator, MinValidator } from './input-number-validators';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule, FormsModule],
    exports: [McInput, McNumberInput, McInputMono, MinValidator, MaxValidator],
    declarations: [McInput, McNumberInput, McInputMono, MinValidator, MaxValidator ]
})
export class McInputModule {
}
