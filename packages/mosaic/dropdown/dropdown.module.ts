import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { McDropdownContent } from './dropdown-content.directive';
import { McDropdownItem } from './dropdown-item.component';
import { MC_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER, McDropdownTrigger } from './dropdown-trigger.directive';
import { McDropdown } from './dropdown.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        McIconModule,
        McToolTipModule
    ],
    exports: [
        McDropdown,
        McDropdownItem,
        McDropdownTrigger,
        McDropdownContent
    ],
    declarations: [
        McDropdown,
        McDropdownItem,
        McDropdownTrigger,
        McDropdownContent
    ],
    providers: [MC_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class McDropdownModule {}
