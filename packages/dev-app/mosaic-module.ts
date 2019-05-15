/**
 * NgModule that includes all Mosaic modules that are required to serve the dev-app.
 */
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { BidiModule } from '@ptsecurity/cdk/bidi';
import {
    McButtonModule,
    McIconModule,
    McNavbarModule,
    McInputModule,
    McFormFieldModule,
    McDatepickerModule
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

        McFormFieldModule,

        A11yModule,
        BidiModule
    ]
})
export class DevAppMosaicModule {
}
