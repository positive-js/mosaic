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
            state('collapsed', style({maxHeight: '0', visibility: 'hidden'})),
            state('expanded', style({maxHeight: '10000px', visibility: 'visible'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
            transition('collapsed <=> expanded', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
        ])
    ]
})
export class ComponentSidenav {

    categories: any;
    icon: string = "mc mc-angle-up-M_16";
    iconClass: string = "nav__trigger-icon";
    iconClassExpanded: string = `${this.icon} ${this.iconClass} ${this.iconClass}_expanded`;
    iconClassCollapsed: string = `${this.icon} ${this.iconClass} ${this.iconClass}_collapsed`;

    constructor(public docItems: DocumentationItems) {
        this.categories = docItems.getCategories('components');
    }
}
