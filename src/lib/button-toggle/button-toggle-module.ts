import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McButtonToggle, McButtonToggleGroup } from './button-toggle';


@NgModule({
    imports: [McCommonModule, McButtonModule],
    exports: [McCommonModule, McButtonToggleGroup, McButtonToggle],
    declarations: [McButtonToggleGroup, McButtonToggle]
})
export class McButtonToggleModule {}
