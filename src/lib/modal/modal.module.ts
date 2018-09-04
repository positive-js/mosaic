import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { CssUnitPipe } from './css-unit.pipe';
import { McModalControlService } from './modal-control.service';
import { McModalComponent } from './modal.component';
import { McModalService } from './modal.service';


@NgModule({
    imports: [ CommonModule, OverlayModule, McButtonModule, McIconModule ],
    exports: [ McModalComponent ],
    declarations: [ McModalComponent, CssUnitPipe ],
    entryComponents: [ McModalComponent ],
    providers: [ McModalControlService, McModalService ]
})
export class McModalModule { }
