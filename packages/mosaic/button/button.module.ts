import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

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
