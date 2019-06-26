/**
 * NgModule that includes all Mosaic modules that are required to serve the dev-app.
 */
import { BidiModule } from '@angular/cdk/bidi';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import {
    McButtonModule,
    McIconModule,
    McNavbarModule,
    McInputModule,
    McFormFieldModule,
    McDatepickerModule, McDropdownModule
} from '@ptsecurity/mosaic';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';


@NgModule({
    exports: [
        McIconModule,
        McButtonModule,
        McInputModule,
        McNavbarModule,
        McMomentDateModule,
        McDatepickerModule,
        McDropdownModule,

        McFormFieldModule,

        A11yModule,
        BidiModule
    ]
})
export class DevAppMosaicModule {
}
