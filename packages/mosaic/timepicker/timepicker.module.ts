import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { McTimepicker } from './timepicker';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        FormsModule
    ],
    declarations: [
        McTimepicker
    ],
    exports: [
        McTimepicker
    ]
})
export class McTimepickerModule {}
