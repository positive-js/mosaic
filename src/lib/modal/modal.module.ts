import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OverlayModule } from '@ptsecurity/cdk/overlay';

import { McButtonModule } from '../button';

import { McModalControlService } from './modal-control.service';
import { McModalComponent } from './modal.component';
import { McModalService } from './modal.service';


@NgModule({
    imports: [ CommonModule, OverlayModule, McButtonModule ],
    exports: [ McModalComponent ],
    declarations: [ McModalComponent ],
    entryComponents: [ McModalComponent ],
    providers: [ McModalControlService, McModalService ]
})
export class McModalModule { }
