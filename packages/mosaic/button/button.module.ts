import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McButton,
    McButtonCssStyler
} from './button.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McButton,
        McButtonCssStyler
    ],
    declarations: [
        McButton,
        McButtonCssStyler
    ]
})
export class McButtonModule {}
