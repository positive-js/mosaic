import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McTextarea } from './textarea.component';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule, FormsModule],
    exports: [McTextarea],
    declarations: [McTextarea]
})
export class McTextareaModule {}
