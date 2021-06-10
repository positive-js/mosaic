import { A11yModule } from '@angular/cdk/a11y';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McCommonModule } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McTabBody, McTabBodyPortal } from './tab-body.component';
import { McTabContent } from './tab-content.directive';
import {
    McTabGroup,
    McOldTabsCssStyler,
    McAlignTabsCenterCssStyler,
    McAlignTabsEndCssStyler,
    McStretchTabsCssStyler,
    McVerticalTabsCssStyler
} from './tab-group.component';
import { McTabHeader } from './tab-header.component';
import { McTabLabelWrapper } from './tab-label-wrapper.directive';
import { McTabLabel } from './tab-label.directive';
import { McTabLink, McTabNav } from './tab-nav-bar';
import { McTab } from './tab.component';


@NgModule({
    imports: [
        CommonModule,
        PortalModule,
        A11yModule,
        McCommonModule,
        McIconModule
    ],
    // Don't export all components because some are only to be used internally.
    exports: [
        McCommonModule,
        McTabGroup,
        McTabLabel,
        McTab,
        McTabNav,
        McTabLink,
        McTabContent,
        McOldTabsCssStyler,
        McAlignTabsCenterCssStyler,
        McAlignTabsEndCssStyler,
        McStretchTabsCssStyler,
        McVerticalTabsCssStyler
    ],
    declarations: [
        McTabGroup,
        McTabLabel,
        McTab,
        McTabLabelWrapper,
        McTabNav,
        McTabLink,
        McTabBody,
        McTabBodyPortal,
        McTabHeader,
        McTabContent,
        McOldTabsCssStyler,
        McAlignTabsCenterCssStyler,
        McAlignTabsEndCssStyler,
        McStretchTabsCssStyler,
        McVerticalTabsCssStyler
    ]
})
export class McTabsModule {}
