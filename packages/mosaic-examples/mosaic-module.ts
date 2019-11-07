import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';


@NgModule({

     imports: [
         McButtonModule,
         McCheckboxModule,
         McDropdownModule,
         McRadioModule,
         McFormFieldModule,
         McTextareaModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule,
        McDropdownModule,
        McRadioModule,
        McFormFieldModule,
        McTextareaModule
    ]
})
export class ExampleMosaicModule {}
