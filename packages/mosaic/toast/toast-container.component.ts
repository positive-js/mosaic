import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ToastService } from './toast.service';
import { ToastData } from './toast.type';


@Component({
    selector: 'mc-toast-container',
    template: `<ng-container #container></ng-container>`,
    styleUrls: ['./toast.component.scss']
})
export class ToastContainerComponent {
    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

    constructor(
        private toastService: ToastService
    ) {
    }

    get toasts(): ToastData[] {
        return this.toastService.toasts.value;
    }

}
