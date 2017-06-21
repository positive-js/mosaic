import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButton, McButtonStyler } from './button.component';


@NgModule({
    imports: [
        CommonModule,
    ],
    exports: [
        McButton,
        McButtonStyler
    ],
    declarations: [
        McButton,
        McButtonStyler
    ]
})
export class McButtonModule {}
