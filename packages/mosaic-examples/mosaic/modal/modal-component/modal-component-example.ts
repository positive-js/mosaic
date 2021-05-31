// tslint:disable:no-console
import { Component, Input } from '@angular/core';
import { McModalRef, McModalService } from '@ptsecurity/mosaic/modal';


/**
 * @title Component Modal
 */
@Component({
    selector: 'modal-component-example',
    templateUrl: 'modal-component-example.html',
    styleUrls: ['modal-component-example.css']
})
export class ModalComponentExample {
    componentModal: McModalRef;

    constructor(private modalService: McModalService) {}

    openModal() {
        this.componentModal = this.modalService.open({
            mcComponent: McModalCustomComponent,
            mcComponentParams: {
                title: 'Title',
                subtitle: 'Subtitle'
            }
        });

        this.componentModal.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.componentModal.afterClose.subscribe((action: 'save' | 'close') => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}

@Component({
    selector: 'mc-modal-full-custom-component',
    template: `
        <mc-modal-title>
            Modal Title
        </mc-modal-title>

        <mc-modal-body>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button mc-button [color]="'primary'" (click)="destroyModal('close')">destroy modal in the component</button>
            </p>
        </mc-modal-body>

        <div mc-modal-footer>
            <button mc-button [color]="'primary'" (click)="destroyModal('save')">Save</button>
            <button mc-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
  `
})
export class McModalCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: McModalRef) { }

    destroyModal(action: 'save' | 'close') {
        this.modal.destroy(action);
    }
}
