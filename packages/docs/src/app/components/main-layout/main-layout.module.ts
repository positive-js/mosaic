import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTreeModule } from '@ptsecurity/mosaic/tree';
import { McVerticalNavbarModule } from '@ptsecurity/mosaic/vertical-navbar';

import { TreeComponent } from '../tree/tree.component';

import { MainLayoutComponent } from './main-layout.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        McTreeModule,
        McVerticalNavbarModule,
        McButtonModule,
        McIconModule,
        McDropdownModule
    ],
    exports: [MainLayoutComponent],
    declarations: [MainLayoutComponent, TreeComponent]
})
export class MainLayoutModule {}
