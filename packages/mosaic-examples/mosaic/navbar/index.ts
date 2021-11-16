import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';
import { McPopoverModule } from '@ptsecurity/mosaic/popover';

import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';
import { NavbarVerticalExample } from './navbar-vertical/navbar-vertical-example';


export {
    NavbarOverviewExample,
    NavbarVerticalExample
};

const EXAMPLES = [
    NavbarOverviewExample,
    NavbarVerticalExample
];

@NgModule({
    imports: [
        CommonModule,
        McNavbarModule,
        McIconModule,
        McButtonModule,
        McDropdownModule,
        McPopoverModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
