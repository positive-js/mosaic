import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER, McOptionModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';

import { McSelect, McSelectSearch, McSelectTrigger } from './select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McOptionModule,
        McIconModule,
        McTagsModule
    ],
    exports: [
        McFormFieldModule,
        McSelect,
        McSelectSearch,
        McSelectTrigger,
        McOptionModule,
        CommonModule
    ],
    declarations: [
        McSelect,
        McSelectSearch,
        McSelectTrigger],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McSelectModule {}
