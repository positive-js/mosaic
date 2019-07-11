import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { CssUnitPipe } from './css-unit.pipe';
import { McModalControlService } from './modal-control.service';
import { McModalComponent } from './modal.component';
import { McModalBody, McModalFooter, McModalTitle } from './modal.directive';
import { McModalService } from './modal.service';


@NgModule({
    imports: [CommonModule, OverlayModule, A11yModule, McButtonModule, McIconModule],
    exports: [
        McModalComponent,
        McModalTitle,
        McModalBody,
        McModalFooter
    ],
    declarations: [
        McModalComponent,
        McModalTitle,
        McModalBody,
        McModalFooter,
        CssUnitPipe
    ],
    entryComponents: [McModalComponent],
    providers: [McModalControlService, McModalService]
})
export class McModalModule {}
