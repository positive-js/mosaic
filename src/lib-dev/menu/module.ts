import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { MatMenuModule } from '@ptsecurity/mosaic/menu';

// import { McButtonModule } from '../../lib/button';
// import { McIconModule } from '../../lib/icon';

import { MenuDemo } from './menu-demo';


@NgModule({
  imports: [
    CommonModule,
    McButtonModule,
    McIconModule,
    MatMenuModule,
    RouterModule.forChild([{path: '', component: MenuDemo}])
  ],
  declarations: [MenuDemo]
})
export class MenuDemoModule {
}
