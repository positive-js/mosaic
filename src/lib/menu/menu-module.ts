import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@ptsecurity/cdk/overlay';
import { McCommonModule } from '@ptsecurity/mosaic/core';

import { MatMenuContent } from './menu-content';
import { MatMenu } from './menu-directive';
import { MatMenuItem } from './menu-item';
import { MatMenuTrigger, MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER } from './menu-trigger';


@NgModule({
  imports: [
    CommonModule,
    McCommonModule,
    OverlayModule
  ],
  exports: [MatMenu, MatMenuItem, MatMenuTrigger, MatMenuContent, McCommonModule],
  declarations: [MatMenu, MatMenuItem, MatMenuTrigger, MatMenuContent],
  providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class MatMenuModule {}
