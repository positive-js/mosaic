import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';

import { DocumentationItems } from '../../shared/documentation-items/documentation-items';


@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.scss'],
    animations: [
        trigger('bodyExpansion', [
            state('collapsed', style({maxHeight: '0', visibility: 'hidden'})),
            state('expanded', style({maxHeight: '10000px', visibility: 'visible'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
            transition('collapsed <=> expanded', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
        ])
    ]
})
export class ComponentSidenav {

    params: Observable<Params> | undefined;

    icon: string = 'mc mc-angle-up-M_16';
    iconClass: string = 'nav__trigger-icon';
    iconClassExpanded: string = `${this.icon} ${this.iconClass} ${this.iconClass}_expanded`;
    iconClassCollapsed: string = `${this.icon} ${this.iconClass} ${this.iconClass}_collapsed`;

    constructor(
        public docItems: DocumentationItems,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
        // Combine params from all of the path into a single object.
        this.params = combineLatest(
            this.route.pathFromRoot.map((route) => route.params), Object.assign);
    }
}
