/**
 * NgModule that includes all Mosaic modules that are required to serve the dev-app.
 */
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { BidiModule } from '@ptsecurity/cdk/bidi';
import { McButtonModule } from '@ptsecurity/mosaic';


@NgModule({
  exports: [
    McButtonModule,

    A11yModule,
    BidiModule
  ]
})
export class DevAppMosaicModule {}
