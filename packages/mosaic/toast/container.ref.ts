import { ViewContainerRef } from '@angular/core';

import { ToastService } from './toast.service';


export class ContainerRef {
    constructor(
        private ref: ViewContainerRef,
        private toastService: ToastService
    ) {}

    close(index) {
        if (this.ref.length < 1) {
            return;
        }

        const componentRef = this.toastService.componentsRef.filter((x) => x.instance.index === index)[0];
        const vcrIndex: number = this.ref.indexOf(componentRef.hostView);
        this.ref.remove(vcrIndex);
        this.toastService.componentsRef = this.toastService.componentsRef.filter((x) => x.instance.index !== index);
    }
}
