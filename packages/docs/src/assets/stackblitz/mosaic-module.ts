import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McHighlightModule, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McListModule } from '@ptsecurity/mosaic/list';
import { McRadioModule } from '@ptsecurity/mosaic/radio';
import { McSelectModule } from '@ptsecurity/mosaic/select';
import { McProgressBarModule } from '@ptsecurity/mosaic/progress-bar';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McTreeSelectModule } from '@ptsecurity/mosaic/tree-select';


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
        McSelectModule,
        McListModule,
        McTreeModule,
        McIconModule,
        McHighlightModule,
        FormsModule,
        McPseudoCheckboxModule,
        CdkTreeModule,
        ReactiveFormsModule,
        McTreeSelectModule
    ]
})
export class DemoMosaicModule {}
