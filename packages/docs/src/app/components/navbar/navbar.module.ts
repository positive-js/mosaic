import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';
import { McNavbarModule } from '@ptsecurity/mosaic/navbar';
import { McSelectModule } from '@ptsecurity/mosaic/select';

import { NavbarComponent } from './navbar.component';


@NgModule({
    imports: [
        CommonModule,
        McButtonModule,
        McDropdownModule,
        McLinkModule,
        McIconModule,
        McSelectModule,
        McNavbarModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
