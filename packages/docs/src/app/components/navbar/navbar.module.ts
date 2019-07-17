import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NavbarComponent } from './navbar.component';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McLinkModule } from '@ptsecurity/mosaic/link';



@NgModule({
    imports: [
        CommonModule,
        McIconModule,
        McButtonModule,
        McDropdownModule,
        McLinkModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
