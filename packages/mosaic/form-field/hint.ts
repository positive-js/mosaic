import { Component, Directive, ElementRef, Input } from '@angular/core';

import { McFormField } from './form-field';


let nextHintUniqueId = 0;
let nextPasswordHintUniqueId = 0;

@Directive({
    selector: 'mc-hint',
    host: {
        class: 'mc-hint',
        '[attr.id]': 'id'
    }
})
export class McHint {
    @Input() id: string = `mc-hint-${nextHintUniqueId++}`;
}

@Component({
    selector: 'mc-password-hint',
    template: `
        <i *ngIf="true" mc-icon="mc-close-M_16"></i>
        <i *ngIf="control" mc-icon="mc-check_16"></i>

        <ng-content></ng-content>
    `,
    host: {
        class: 'mc-password-hint',
        '[attr.id]': 'id'
    }
})
export class McPasswordHint {
    @Input() id: string = `mc-hint-${nextPasswordHintUniqueId++}`;

    @Input() control;

    constructor(
        private elementRef: ElementRef,
        private formField: McFormField
    ) {
        console.log('elementRef: ', this.elementRef);
        console.log('formField: ', this.formField);
    }
}
