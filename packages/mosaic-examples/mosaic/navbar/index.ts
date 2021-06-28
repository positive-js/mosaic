import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';

import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';


export {
    NavbarOverviewExample
};

const EXAMPLES = [
    NavbarOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McNavbarModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {
}
