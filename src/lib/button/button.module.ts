import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import {
    McButton,
    McAnchor,
    McIconButton,
    McButtonCSSStyler,
    McXSButtonCSSStyler,
    McSMButtonCSSStyler,
    McLGButtonCSSStyler,
    McXLButtonCSSStyler,
    McIconButtonCSSStyler
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
        McIconButton,
        McButtonCSSStyler,
        McXSButtonCSSStyler,
        McSMButtonCSSStyler,
        McLGButtonCSSStyler,
        McXLButtonCSSStyler,
        McIconButtonCSSStyler
    ],
    declarations: [
        McButton,
        McAnchor,
        McIconButton,
        McButtonCSSStyler,
        McXSButtonCSSStyler,
        McSMButtonCSSStyler,
        McLGButtonCSSStyler,
        McXLButtonCSSStyler,
        McIconButtonCSSStyler
    ]
})
export class McButtonModule {}
