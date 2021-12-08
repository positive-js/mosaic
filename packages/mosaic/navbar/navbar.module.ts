import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import {
    McNavbarFocusableItem,
    McNavbarBrand,
    McNavbarDivider,
    McNavbarItem,
    McNavbarLogo,
    McNavbarTitle,
    McNavbarRectangleElement,
    McNavbarToggle,
    McNavbarSubTitle,
    McNavbarBento
} from './navbar-item.component';
import { McNavbar, McNavbarContainer } from './navbar.component';
import { McVerticalNavbar } from './vertical-navbar.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        McIconModule,
        McToolTipModule
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
        McNavbarFocusableItem,
        McNavbarRectangleElement,
        McNavbarSubTitle,
        McNavbarBento
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
        McNavbarFocusableItem,
        McNavbarRectangleElement,
        McNavbarSubTitle,
        McNavbarBento
    ]
})
export class McNavbarModule {}
