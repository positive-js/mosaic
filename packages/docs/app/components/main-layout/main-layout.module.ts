import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McVerticalNavbarModule } from '@ptsecurity/mosaic/vertical-navbar';

import { MainLayoutComponent } from './main-layout.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        McVerticalNavbarModule,
        McButtonModule,
        McIconModule,
        McDropdownModule

    ],
    exports: [MainLayoutComponent],
    declarations: [MainLayoutComponent]
})
export class MainLayoutModule {}
