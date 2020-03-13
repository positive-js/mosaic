import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McButton,
    McAnchor,
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
        McAnchor,
        McButtonCssStyler
    ],
    declarations: [
        McButton,
        McAnchor,
        McButtonCssStyler
    ]
})
export class McButtonModule {}
