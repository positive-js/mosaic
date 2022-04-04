import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER, McOptionModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { McSelectOption } from './select-option.directive';
import { McSelect, McSelectSearch, McSelectSearchEmptyResult, McSelectTrigger } from './select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McOptionModule,
        McIconModule,
        McTagsModule,
        McToolTipModule
    ],
    exports: [
        McFormFieldModule,
        McSelect,
        McSelectSearch,
        McSelectSearchEmptyResult,
        McSelectTrigger,
        McSelectOption,
        McOptionModule,
        CommonModule
    ],
    declarations: [
        McSelect,
        McSelectSearch,
        McSelectSearchEmptyResult,
        McSelectTrigger,
        McSelectOption
    ],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McSelectModule {}
