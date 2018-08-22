import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McInput, McInputMono } from './input';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule, FormsModule],
    exports: [McInput, McInputMono],
    declarations: [McInput, McInputMono]
})
export class McInputModule {
}
