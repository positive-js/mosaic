import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McVerticalNavbarItem,
    McVerticalNavbarItemIcon,
    McVerticalNavbarItemMenu
} from './vertical-navbar-item.component';
import {
    McVerticalNavbar,
    McVerticalNavbarContainer,
    McNavbarTitle,
    McNavbarBrand,
    McNavbarLogo,
    McNavbarItemBadge
} from './vertical-navbar.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        McIconModule
    ],
    exports: [
        McVerticalNavbar,
        McVerticalNavbarContainer,
        McNavbarTitle,
        McVerticalNavbarItem,
        McVerticalNavbarItemIcon,
        McVerticalNavbarItemMenu,
        McNavbarItemBadge,
        McNavbarBrand,
        McNavbarLogo
    ],
    declarations: [
        McVerticalNavbar,
        McVerticalNavbarContainer,
        McNavbarTitle,
        McVerticalNavbarItem,
        McVerticalNavbarItemIcon,
        McVerticalNavbarItemMenu,
        McNavbarItemBadge,
        McNavbarBrand,
        McNavbarLogo
    ]
})
export class McVerticalNavbarModule {}
