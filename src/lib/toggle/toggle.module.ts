import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McToggleComponent } from './toggle.component';


@NgModule({
    imports: [CommonModule, BrowserAnimationsModule, A11yModule, McCommonModule],
    exports: [McToggleComponent],
    declarations: [McToggleComponent]
})
export class McToggleModule {
}
