import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagModule } from '@ptsecurity/mosaic/tag';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { McTreeSelectOption } from './tree-select-option.component';
import {
    MC_TREE_SELECT_SCROLL_STRATEGY_PROVIDER,
    McTreeSelect,
    McTreeSelectTrigger
} from './tree-select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        CdkTreeModule,
        McTreeModule,
        McIconModule,
        McTagModule
    ],
    exports: [McTreeSelect, McTreeSelectOption, McTreeSelectTrigger, CommonModule],
    declarations: [McTreeSelect, McTreeSelectOption, McTreeSelectTrigger],
    providers: [MC_TREE_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McTreeSelectModule {}
