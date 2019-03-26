import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { McOptionModule, McCommonModule } from '@ptsecurity/mosaic/core';

import { McAutocomplete } from './autocomplete';
import { McAutocompleteOrigin } from './autocomplete-origin';
import {
    McAutocompleteTrigger,
    MC_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './autocomplete-trigger';


@NgModule({
    imports: [McOptionModule, OverlayModule, McCommonModule, CommonModule],
    exports: [
        McAutocomplete,
        McOptionModule,
        McAutocompleteTrigger,
        McAutocompleteOrigin,
        McCommonModule
    ],
    declarations: [McAutocomplete, McAutocompleteTrigger, McAutocompleteOrigin],
    providers: [MC_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class McAutocompleteModule {}
