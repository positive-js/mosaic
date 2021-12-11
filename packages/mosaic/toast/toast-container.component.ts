import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import { ToastService } from './toast.service';
import { ToastData } from './toast.type';


@Component({
    selector: 'mc-toast-container',
    template: `<div class="mc-toast-container" #container>
        <h1 class="mc-title">Toast Container</h1>
    </div>`,
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
