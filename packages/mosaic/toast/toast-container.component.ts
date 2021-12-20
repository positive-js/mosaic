import { query, style, trigger, animate, transition, stagger } from '@angular/animations';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ToastService } from './toast.service';


@Component({
    selector: 'mc-toast-container',
    template: `<div class="toast-container" [@animate]="containerLength"><ng-container #container></ng-container></div>`,
    animations: [
       trigger('animate', [
           transition(':enter, * => 0, * => -1', []),
           transition(':increment', [
               query(':enter', [
                   style({ opacity: 0 }),
                   stagger(50, [
                       animate('300ms ease-out', style({ opacity: 1, width: '*' }))
                   ])
               ], { optional: true })
           ]),
           transition(':decrement', [
               query(':leave', [
                   animate('120ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0 }))
               ], { optional: true })
           ])
       ])
    ]
})
export class ToastContainerComponent {
    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private toastService: ToastService
    ) {
    }

    get containerLength(): number {
        return this.toastService.componentsRef.length;
    }
}
