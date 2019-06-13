import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { ComponentListComponent } from './component-list.component';


@NgModule({
    imports: [
        CommonModule,

    ],
    exports: [ComponentListComponent],
    declarations: [ComponentListComponent]
})
export class ComponentListModule {}
