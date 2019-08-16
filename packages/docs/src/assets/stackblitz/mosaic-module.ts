import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';


@NgModule({
    exports: [
        McButtonModule,
        McCheckboxModule
    ]
})
export class DemoMosaicModule {
}
