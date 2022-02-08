import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { McTreeSelect, McTreeSelectFooter, McTreeSelectTrigger } from './tree-select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McTreeModule,
        McIconModule,
        McTagsModule,
        McPseudoCheckboxModule,
        McSelectModule
    ],
    exports: [McTreeSelect, McTreeSelectTrigger, McTreeSelectFooter, CommonModule],
    declarations: [McTreeSelect, McTreeSelectTrigger, McTreeSelectFooter],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McTreeSelectModule {}
