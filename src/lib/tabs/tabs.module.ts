import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PortalModule } from '@ptsecurity/cdk/portal';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McTab } from './tab';
import { McTabBody, McTabBodyPortal } from './tab-body';
import { McTabContent } from './tab-content';
import {
  McTabGroup,
  McLightTabsCssStyler,
  McAlignTabsCenterCssStyler,
  McAlignTabsEndCssStyler,
  McStretchTabsCssStyler
} from './tab-group';
import { McTabHeader } from './tab-header';
import { McTabLabel } from './tab-label';
import { McTabLabelWrapper } from './tab-label-wrapper';
import { McTabLink, McTabNav } from './tab-nav-bar/tab-nav-bar';


@NgModule({
  imports: [
    CommonModule,
    McCommonModule,
    PortalModule,
    A11yModule,
    BrowserAnimationsModule
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
    McStretchTabsCssStyler
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
    McStretchTabsCssStyler
  ]
})
export class McTabsModule { }
