import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';

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
