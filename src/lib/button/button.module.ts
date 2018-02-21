import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import {
    McButton, McButtonCSSStyler, McXSButtonCSSStyler, McSMButtonCSSStyler, McLGButtonCSSStyler, McXLButtonCSSStyler
} from './button.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McButton,
        McButtonCSSStyler,
        McXSButtonCSSStyler,
        McSMButtonCSSStyler,
        McLGButtonCSSStyler,
        McXLButtonCSSStyler
    ],
    declarations: [
        McButton,
        McButtonCSSStyler,
        McXSButtonCSSStyler,
        McSMButtonCSSStyler,
        McLGButtonCSSStyler,
        McXLButtonCSSStyler
    ]
})
export class McButtonModule {}
