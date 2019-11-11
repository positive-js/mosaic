import { NgModule } from '@angular/core';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McRadioModule } from '@ptsecurity/mosaic/radio';


@NgModule({

     imports: [
         McButtonModule,
         McCheckboxModule,
         McDropdownModule,
         McRadioModule,
         McMomentDateModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule,
        McRadioModule,
        McMomentDateModule
    ]
})
export class ExampleMosaicModule {}
