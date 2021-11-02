import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { McTreeSelect, McTreeSelectTrigger } from './tree-select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McTreeModule,
        McIconModule,
        McTagsModule,
        McPseudoCheckboxModule
    ],
    exports: [McTreeSelect, McTreeSelectTrigger, CommonModule],
    declarations: [McTreeSelect, McTreeSelectTrigger],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McTreeSelectModule {}
