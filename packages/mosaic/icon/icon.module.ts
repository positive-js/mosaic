import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McIcon,
    McIconCSSStyler
} from './icon.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McIcon,
        McIconCSSStyler
    ],
    declarations: [
        McIcon,
        McIconCSSStyler
    ]
})
export class McIconModule {}
