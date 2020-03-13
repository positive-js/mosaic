import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McToggleComponent } from './toggle.component';


@NgModule({
    imports: [CommonModule, A11yModule, McCommonModule],
    exports: [McToggleComponent],
    declarations: [McToggleComponent]
})
export class McToggleModule {
}
