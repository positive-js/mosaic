import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';

import { McTimepicker } from './timepicker';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        FormsModule,
        McMomentDateModule
    ],
    declarations: [
        McTimepicker
    ],
    exports: [
        McTimepicker
    ]
})
export class McTimepickerModule {}
