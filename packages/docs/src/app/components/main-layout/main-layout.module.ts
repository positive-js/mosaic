import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { MainLayoutComponent } from './main-layout.component';
import { NavbarModule } from '../navbar';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        McTreeModule,
        NavbarModule,
        McButtonModule,
        McIconModule,
        McDropdownModule
    ],
    exports: [MainLayoutComponent],
    declarations: [MainLayoutComponent]
})
export class MainLayoutModule {}
