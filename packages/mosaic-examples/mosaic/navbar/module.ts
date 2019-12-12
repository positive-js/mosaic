import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';

import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';


const EXAMPLES = [
    NavbarOverviewExample
];

@NgModule({
    imports: [
        BrowserModule,
        McNavbarModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {
}
