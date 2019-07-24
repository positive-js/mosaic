import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { ViewEncapsulation } from '@schematics/angular/component/schema';

import { DocumentationItems } from '../../shared/documentation-items/documentation-items';


@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('bodyExpansion', [
            state('collapsed', style({height: '0px', display: 'none'})),
            state('expanded', style({height: '*', display: 'block'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
        ])
    ]
})
export class ComponentSidenav {

    categories: any;

    constructor(public docItems: DocumentationItems) {
        this.categories = docItems.getCategories('components');
    }
}
