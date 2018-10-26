import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McDropdown } from './dropdown';
import { McDropdownContent } from './dropdown-content';
import { McDropdownItem } from './dropdown-item';
import { MC_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER, McDropdownTrigger } from './dropdown-trigger';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McIconModule
    ],
    exports: [McDropdown, McDropdownItem, McDropdownTrigger, McDropdownContent, CommonModule],
    declarations: [McDropdown, McDropdownItem, McDropdownTrigger, McDropdownContent],
    providers: [MC_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class McDropdownModule {}
