import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import { McDivider } from './divider';


@NgModule({
  imports: [CommonModule],
  exports: [
    McDivider,
//    MatCommonModule,
  ],
  declarations: [
      McDivider,
  ],
})
export class McDividerModule {}
