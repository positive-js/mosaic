import { NgModule } from '@angular/core';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McModalModule } from '@ptsecurity/mosaic/modal';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';


@NgModule({

    imports: [
        McButtonModule,
        McCheckboxModule,
        McDropdownModule,
        McRadioModule,
        McMomentDateModule,
        McFormFieldModule,
        McTextareaModule,
        McModalModule
    ],
    exports: [
        McButtonModule,
        McCheckboxModule,
        McRadioModule,
        McMomentDateModule,
        McDropdownModule,
        McFormFieldModule,
        McTextareaModule,
        McModalModule
    ]
})
export class ExampleMosaicModule {}
