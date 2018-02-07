import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButton, McButtonCSSStyler } from './button.component';
import { A11yModule } from '../../cdk/a11y';
import { PlatformModule } from '../../cdk/platform';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McButton,
        McButtonCSSStyler
    ],
    declarations: [
        McButton,
        McButtonCSSStyler
    ]
})
export class McButtonModule {}
