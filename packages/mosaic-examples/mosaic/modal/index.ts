import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormsModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McModalModule } from '@ptsecurity/mosaic/modal';

import { ModalComponentExample, McModalCustomComponent } from './modal-component/modal-component-example';
import { ModalMultipleExample } from './modal-multiple/modal-multiple-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { McLongComponent, ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalSizesExample } from './modal-sizes/modal-sizes-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';


export {
    ModalOverviewExample,
    ModalComponentExample,
    McModalCustomComponent,
    ModalTemplateExample,
    ModalScrollExample,
    McLongComponent,
    ModalSizesExample,
    ModalMultipleExample
};

const EXAMPLES = [
    ModalOverviewExample,
    ModalComponentExample,
    McModalCustomComponent,
    ModalTemplateExample,
    ModalScrollExample,
    McLongComponent,
    ModalSizesExample,
    ModalMultipleExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McButtonModule,
        McModalModule,
        McIconModule,
        McInputModule,
        McFormFieldModule,
        McFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
