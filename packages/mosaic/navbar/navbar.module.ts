import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McNavbarItemBase,
    McNavbarBrand,
    McNavbarDivider,
    McNavbarItem,
    McNavbarLogo,
    McNavbarTitle
} from './navbar-item.component';
import { McNavbar, McNavbarContainer } from './navbar.component';
import { McNavbarToggle, McVerticalNavbar } from './vertical-navbar.component';


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
        McVerticalNavbar,
        McNavbarDivider,
        McNavbarItemBase
    ],
    declarations: [
        McNavbar,
        McNavbarContainer,
        McNavbarTitle,
        McNavbarItem,
        McNavbarBrand,
        McNavbarLogo,
        McNavbarToggle,
        McVerticalNavbar,
        McNavbarDivider,
        McNavbarItemBase
    ]
})
export class McNavbarModule {}
