import { A11yModule } from '@angular/cdk/a11y';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McTabBody, McTabBodyPortal } from './tab-body.component';
import { McTabContent } from './tab-content.directive';
import {
    McTabGroup,
    McLightTabsCssStyler,
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
        McCommonModule,
        PortalModule,
        A11yModule
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
        McLightTabsCssStyler,
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
        McLightTabsCssStyler,
        McAlignTabsCenterCssStyler,
        McAlignTabsEndCssStyler,
        McStretchTabsCssStyler,
        McVerticalTabsCssStyler
    ]
})
export class McTabsModule {}
