import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { CompComponent } from './comp.component';


@NgModule({
    imports: [
        CommonModule,

    ],
    exports: [CompComponent],
    declarations: [CompComponent]
})
export class CompModule {}
