import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { ViewEncapsulation } from '@schematics/angular/component/schema';


@Component({
    selector: 'app-accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['./accordion.component.scss'],
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
export class ComponentAccordion {
    @Input() categories: any[] = [];

    icon: string = "mc mc-angle-up-M_16";
    iconClass: string = "app-accordion__trigger-icon";
    iconClassExpanded: string = `${this.icon} ${this.iconClass} ${this.iconClass}_expanded`;
    iconClassCollapsed: string = `${this.icon} ${this.iconClass} ${this.iconClass}_collapsed`;

    constructor(){}
}
