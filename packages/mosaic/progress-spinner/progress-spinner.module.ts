import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McProgressSpinner } from './progress-spinner.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule
    ],
    exports: [
        McProgressSpinner
    ],
    declarations: [
        McProgressSpinner
    ]
})
export class McProgressSpinnerModule {}
