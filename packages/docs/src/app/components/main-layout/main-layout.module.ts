import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { NavbarModule } from '../navbar';
import { SidenavModule } from '../sidenav/sidenav.module';

import { MainLayoutComponent } from './main-layout.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        McTreeModule,
        McButtonModule,
        McIconModule,
        McDropdownModule,

        NavbarModule,
        SidenavModule
    ],
    exports: [MainLayoutComponent],
    declarations: [MainLayoutComponent]
})
export class MainLayoutModule {}
