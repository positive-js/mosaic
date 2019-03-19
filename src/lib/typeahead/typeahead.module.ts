import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { MC_SELECT_SCROLL_STRATEGY_PROVIDER, McOptionModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagModule } from '@ptsecurity/mosaic/tag';

import { McTypeahead, McTypeaheadTrigger } from './typeahead.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McOptionModule,
        McIconModule,
        McTagModule
    ],
    exports: [McFormFieldModule, McTypeahead, McTypeaheadTrigger, McOptionModule, CommonModule],
    declarations: [McTypeahead, McTypeaheadTrigger],
    providers: [MC_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class McTypeaheadModule {}
