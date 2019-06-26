import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McOptionModule, McCommonModule } from '@ptsecurity/mosaic/core';

import { McAutocompleteOrigin } from './autocomplete-origin.directive';
import {
    McAutocompleteTrigger,
    MC_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './autocomplete-trigger.directive';
import { McAutocomplete } from './autocomplete.component';


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
