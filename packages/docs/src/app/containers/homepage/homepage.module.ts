import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { NavbarModule } from '../../components/navbar';

import { HomepageComponent } from './homepage.component';


@NgModule({
    imports: [RouterModule, NavbarModule, McButtonModule],
    exports: [HomepageComponent],
    declarations: [HomepageComponent]
})
export class HomepageModule {
}
