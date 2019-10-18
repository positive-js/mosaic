import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McRadioModule } from '@ptsecurity/mosaic/radio';


@NgModule({

     imports: [
         McButtonModule,
         McCheckboxModule,
         McRadioModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule,
        McRadioModule
    ]
})
export class ExampleMosaicModule {}
