import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { ComponentAccordion } from './accordion.component';


@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        McIconModule,
        CdkAccordionModule
    ],
    exports: [ComponentAccordion],
    declarations: [ComponentAccordion]
})
export class AccordionModule {}
