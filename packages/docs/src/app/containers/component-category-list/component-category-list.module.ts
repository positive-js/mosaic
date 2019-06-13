import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ComponentCategoryList } from './component-category-list.component';


@NgModule({
    imports: [CommonModule, RouterModule],
    exports: [ComponentCategoryList],
    declarations: [ComponentCategoryList],
    providers: []
})
export class ComponentCategoryListModule { }
