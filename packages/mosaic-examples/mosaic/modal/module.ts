import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McModalModule } from '@ptsecurity/mosaic/modal';

import { ModalComponentExample, McModalCustomComponent } from './modal-component/modal-component-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';


const EXAMPLES = [
    ModalOverviewExample,
    ModalComponentExample,
    McModalCustomComponent,
    ModalTemplateExample
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
