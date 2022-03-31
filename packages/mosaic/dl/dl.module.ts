import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    McDlComponent,
    McDtComponent,
    McDdComponent
} from './dl.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        McDlComponent,
        McDtComponent,
        McDdComponent
    ],
    declarations: [
        McDlComponent,
        McDtComponent,
        McDdComponent
    ]
})
export class McDlModule {}
