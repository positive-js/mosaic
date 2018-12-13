import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { PortalModule } from '@ptsecurity/cdk/portal';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { McSidepanelContainerComponent } from './sidepanel-container.component';
import { McSidepanelService } from './sidepanel.service';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        McCommonModule
    ],
    providers: [McSidepanelService],
    declarations: [McSidepanelContainerComponent],
    entryComponents: [McSidepanelContainerComponent],
    exports: [McSidepanelContainerComponent]
})
export class McSidepanelModule {}
