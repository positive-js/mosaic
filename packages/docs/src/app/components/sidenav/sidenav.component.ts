import { Component } from '@angular/core';
import { ViewEncapsulation } from '@schematics/angular/component/schema';

import { DocumentationItems } from '../../shared/documentation-items/documentation-items';


@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ComponentSidenav {

    categories: any;

    constructor(public docItems: DocumentationItems) {
        this.categories = docItems.getCategories('components');
    }
}
