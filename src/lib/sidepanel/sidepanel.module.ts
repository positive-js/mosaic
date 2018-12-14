import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { PortalModule } from '@ptsecurity/cdk/portal';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McSidepanelContainerComponent } from './sidepanel-container.component';
import { McSidepanelClose } from './sidepanel-directives';
import { McSidepanelService } from './sidepanel.service';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        McCommonModule
    ],
    providers: [McSidepanelService],
    declarations: [
        McSidepanelContainerComponent,
        McSidepanelClose
    ],
    entryComponents: [McSidepanelContainerComponent],
    exports: [
        McSidepanelContainerComponent,
        McSidepanelClose
    ]
})
export class McSidepanelModule {}
