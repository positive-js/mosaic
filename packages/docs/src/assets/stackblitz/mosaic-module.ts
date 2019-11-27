import { NgModule } from '@angular/core';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McProgressBarModule } from '@ptsecurity/mosaic/progress-bar';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';


@NgModule({
    exports: [
        McMomentDateModule,
        McButtonModule,
        McCheckboxModule,
        McDatepickerModule,
        McFormFieldModule,
        McIconModule,
        McInputModule,
        McRadioModule,
        McProgressBarModule,
        McTimepickerModule,
        McSelectModule
    ]
})
export class DemoMosaicModule {
}
