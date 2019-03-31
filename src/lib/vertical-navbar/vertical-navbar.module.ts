import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McVerticalNavbarItem,
    McVerticalNavbarItemBadge,
    McVerticalNavbarItemIcon
} from './vertical-navbar-item.component';
import {
    McVerticalNavbar,
    McVerticalNavbarHeader,
    McVerticalNavbarTitle
} from './vertical-navbar.component';


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
