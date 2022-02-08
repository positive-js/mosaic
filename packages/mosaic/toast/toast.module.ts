import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McToastOutlet, McToastContainerComponent } from './toast-container.component';
import { McToastComponent } from './toast.component';


@NgModule({
    declarations: [
        McToastComponent,
        McToastContainerComponent,
        McToastOutlet
    ],
    imports: [
        CommonModule,
        OverlayModule,
        A11yModule,
        McIconModule
    ]
})
export class ToastModule {}
