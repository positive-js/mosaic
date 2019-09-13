import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McIconModule } from '@ptsecurity/mosaic/icon';


@NgModule({
    exports: [
        McButtonModule,
        McCheckboxModule,
        McIconModule
    ]
})
export class DemoMosaicModule {
}
