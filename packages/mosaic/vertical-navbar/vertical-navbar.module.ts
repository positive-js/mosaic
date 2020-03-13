import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McVerticalNavbarItem,
    McVerticalNavbarItemBadge,
    McVerticalNavbarItemIcon
} from './vertical-navbar-item.component';
import { McVerticalNavbar, McVerticalNavbarHeader, McVerticalNavbarTitle } from './vertical-navbar.component';


const COMPONENTS = [
    McVerticalNavbar,
    McVerticalNavbarTitle,
    McVerticalNavbarItem,
    McVerticalNavbarItemIcon,
    McVerticalNavbarItemBadge,
    McVerticalNavbarHeader
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        McIconModule
    ],
    exports: COMPONENTS,
    declarations: COMPONENTS
})
export class McVerticalNavbarModule {}
