import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NavbarComponent } from './navbar.component';


@NgModule({
    imports: [
        CommonModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
