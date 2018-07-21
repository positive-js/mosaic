import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';

import { CssUnitPipe } from '../core/pipes/css-unit.pipe';

import { McModalControlService } from './modal-control.service';
import { McModalComponent } from './modal.component';
import { McModalService } from './modal.service';


@NgModule({
  imports: [ CommonModule, OverlayModule ],
  exports: [ McModalComponent ],
  declarations: [ McModalComponent, CssUnitPipe ],
  entryComponents: [ McModalComponent ],
  providers: [ McModalControlService, McModalService ]
})
export class McModalModule { }
