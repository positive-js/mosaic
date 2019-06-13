import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';

import { NavbarComponent } from './navbar.component';


@NgModule({
    imports: [
        CommonModule,

        McNavbarModule,
        McIconModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
