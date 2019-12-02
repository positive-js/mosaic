import { Component, Input } from '@angular/core';
import { McModalRef, McModalService } from '@ptsecurity/mosaic/modal';


/**
 * @title Basic Modal
 */
@Component({
    selector: 'modal-overview-example',
    templateUrl: 'modal-overview-example.html',
    styleUrls: ['modal-overview-example.css']
})
export class ModalOverviewExample {

    constructor(
        private modalService: McModalService
    ) {}

    openModal() {
        this.modalService.open({
            mcComponent: McModalCustomComponent
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
                <button mc-button color="primary" (click)="destroyModal()">destroy modal in the component</button>
            </p>
        </mc-modal-body>

        <div mc-modal-footer>
            <button mc-button color="primary" >Save</button>
            <button mc-button autofocus>Close</button>
        </div>
  `
})
export class McModalCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: McModalRef) { }

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}
