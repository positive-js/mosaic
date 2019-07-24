import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NavbarComponent } from './navbar.component';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McLinkModule } from '@ptsecurity/mosaic/link';
import { McSelectModule } from "@ptsecurity/mosaic/select";



@NgModule({
    imports: [
        CommonModule,
        McButtonModule,
        McDropdownModule,
        McLinkModule,
        McIconModule,
        McSelectModule
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent]
})
export class NavbarModule {}
