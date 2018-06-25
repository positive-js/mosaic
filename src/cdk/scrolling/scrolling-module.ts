import {NgModule} from '@angular/core';
import {PlatformModule} from '@ptsecurity/cdk/platform';

import {CdkScrollable} from './scrollable';


@NgModule({
  imports: [PlatformModule],
  exports: [CdkScrollable],
  declarations: [CdkScrollable]
})
export class ScrollDispatchModule {}
