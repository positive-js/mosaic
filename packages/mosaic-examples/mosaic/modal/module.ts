import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McModalModule } from '@ptsecurity/mosaic/modal';

import { ModalComponentExample, McModalCustomComponent } from './modal-component/modal-component-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { McLongComponent, ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';


const EXAMPLES = [
    ModalOverviewExample,
    ModalComponentExample,
    McModalCustomComponent,
    ModalTemplateExample,
    ModalScrollExample,
    McLongComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McButtonModule,
        McModalModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
