import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';


@NgModule({

     imports: [
         McButtonModule,
         McCheckboxModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule
    ]
})
export class ExampleMosaicModule {}
