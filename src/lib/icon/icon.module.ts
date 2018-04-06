import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

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
