import { Component, ViewChild, ViewContainerRef } from '@angular/core';


@Component({
    selector: 'mc-toast-container',
    template: `<ng-container #container></ng-container>`,
    styleUrls: ['./toast.component.scss']
})
export class ToastContainerComponent {
    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
}
