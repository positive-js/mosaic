import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McRadioModule } from '@ptsecurity/mosaic/radio';


@NgModule({

     imports: [
         McButtonModule,
         McCheckboxModule,
         McDropdownModule,
         McRadioModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule,
        McRadioModule
    ]
})
export class ExampleMosaicModule {}
