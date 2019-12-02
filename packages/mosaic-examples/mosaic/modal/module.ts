import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McModalModule } from '@ptsecurity/mosaic/modal';

import { McModalCustomComponent, ModalOverviewExample } from './modal-overview/modal-overview-example';


const EXAMPLES = [
    ModalOverviewExample,
    McModalCustomComponent
];

@NgModule({
    imports: [
        FormsModule,
        McButtonModule,
        McModalModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    entryComponents: [
        McModalCustomComponent
    ]
})
export class ModalExamplesModule {}
