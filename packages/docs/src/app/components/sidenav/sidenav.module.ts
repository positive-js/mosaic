import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DocumentationItems } from '../../shared/documentation-items/documentation-items';
import { AccordionModule } from '../accordion/accordion.module';

import { ComponentSidenav } from './sidenav.component';


@NgModule({
    imports: [
        AccordionModule,
        CommonModule
    ],
    exports: [ComponentSidenav],
    declarations: [ComponentSidenav],
    providers: [DocumentationItems]
})
export class SidenavModule {}
