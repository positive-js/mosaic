import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCommonModule } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McSidepanelContainerComponent } from './sidepanel-container.component';
import {
    McSidepanelActions,
    McSidepanelBody,
    McSidepanelClose,
    McSidepanelFooter,
    McSidepanelHeader
} from './sidepanel-directives';
import { McSidepanelService } from './sidepanel.service';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        McCommonModule,
        McButtonModule,
        McIconModule,
        A11yModule
    ],
    providers: [McSidepanelService],
    declarations: [
        McSidepanelContainerComponent,
        McSidepanelClose,
        McSidepanelHeader,
        McSidepanelBody,
        McSidepanelFooter,
        McSidepanelActions
    ],
    entryComponents: [McSidepanelContainerComponent],
    exports: [
        McSidepanelContainerComponent,
        McSidepanelClose,
        McSidepanelHeader,
        McSidepanelBody,
        McSidepanelFooter,
        McSidepanelActions
    ]
})
export class McSidepanelModule {}
