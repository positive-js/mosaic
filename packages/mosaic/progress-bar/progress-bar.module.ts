import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McProgressBar
} from './progress-bar.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule
    ],
    exports: [
        McProgressBar
    ],
    declarations: [
        McProgressBar
    ]
})
export class McProgressBarModule {}
