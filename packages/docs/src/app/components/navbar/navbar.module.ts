import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
        RouterModule,
        McButtonModule,
        McDropdownModule,
        McLinkModule,
        McIconModule,
        McNavbarModule,
        McSelectModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
