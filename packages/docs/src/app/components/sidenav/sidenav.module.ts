import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { DocumentationItems } from '../../shared/documentation-items/documentation-items';

import { ComponentSidenav } from './sidenav.component';


@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        McIconModule,
        CdkAccordionModule
    ],
    exports: [ComponentSidenav],
    declarations: [ComponentSidenav],
    providers: [DocumentationItems]
})
export class SidenavModule {}
