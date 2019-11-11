import { NgModule } from '@angular/core';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McSelectModule } from '@ptsecurity/mosaic/select';


@NgModule({
    exports: [
        McMomentDateModule,
        McButtonModule,
        McCheckboxModule,
        McFormFieldModule,
        McIconModule,
        McInputModule,
        McTimepickerModule,
        McSelectModule
    ]
})
export class DemoMosaicModule {
}
