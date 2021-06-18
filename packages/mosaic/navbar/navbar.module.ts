import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McNavbarBrand, McNavbarDivider, McNavbarItem, McNavbarLogo, McNavbarTitle } from './navbar-item.component';
import { McNavbarToggle, McNavbarVertical } from './navbar-vertical.component';
import { McNavbar, McNavbarContainer } from './navbar.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        McIconModule
    ],
    exports: [
        McNavbar,
        McNavbarContainer,
        McNavbarTitle,
        McNavbarItem,
        McNavbarBrand,
        McNavbarLogo,
        McNavbarToggle,
        McNavbarVertical,
        McNavbarDivider
    ],
    declarations: [
        McNavbar,
        McNavbarContainer,
        McNavbarTitle,
        McNavbarItem,
        McNavbarBrand,
        McNavbarLogo,
        McNavbarToggle,
        McNavbarVertical,
        McNavbarDivider
    ]
})
export class McNavbarModule {}
