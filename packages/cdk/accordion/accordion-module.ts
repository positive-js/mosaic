import { NgModule } from '@angular/core';

import { CdkAccordion } from './accordion';
import { CdkAccordionItem } from './accordion-item';


@NgModule({
  exports: [
      CdkAccordion, CdkAccordionItem
  ],
  declarations: [
      CdkAccordion, CdkAccordionItem
  ]
})
export class CdkAccordionModule {}
