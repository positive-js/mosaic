import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { McOptionModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER } from '@ptsecurity/mosaic/select';
import { McTagModule } from '@ptsecurity/mosaic/tag';

import { McTreeSelect, McTreeSelectTrigger } from './tree-select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McOptionModule,
        McIconModule,
        McTagModule
    ],
    exports: [McFormFieldModule, McTreeSelect, McTreeSelectTrigger, McOptionModule, CommonModule],
    declarations: [McTreeSelect, McTreeSelectTrigger],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McTreeSelectModule {}
