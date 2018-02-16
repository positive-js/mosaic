import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McList, McListCSSStyler } from './list.component';
import { A11yModule } from '../../cdk/a11y';
import { PlatformModule } from '../../cdk/platform';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McList,
        McListCSSStyler
    ],
    declarations: [
        McList,
        McListCSSStyler
    ]
})
export class McListModule {}
