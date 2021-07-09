import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { McE2EButton } from './button';


const routes: Route[] = [{path: '', component: McE2EButton}];

@NgModule({
    declarations: [McE2EButton],
    imports: [CommonModule, RouterModule.forChild(routes), McButtonModule]
})
// tslint:disable-next-line:naming-convention
export class McE2EButtonModule {
}
