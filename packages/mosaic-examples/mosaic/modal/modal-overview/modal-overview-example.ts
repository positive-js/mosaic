// tslint:disable:no-console
import { Component } from '@angular/core';
import { McModalService, ModalSize } from '@ptsecurity/mosaic/modal';


/**
 * @title Basic Modal
 */
@Component({
    selector: 'modal-overview-example',
    templateUrl: 'modal-overview-example.html',
    styleUrls: ['modal-overview-example.css']
})
export class ModalOverviewExample {

    constructor(private modalService: McModalService) {}

    showConfirmModal() {
        this.modalService.confirm({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });
    }

    showSuccessModal() {
        this.modalService.success({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent   : 'All changes are saved!',
            mcOkText    : 'ОК',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });
    }

    showDeleteModal() {
        this.modalService.delete({
            mcContent   : 'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?',
            mcOkText    : 'Delete',
            mcCancelText: 'Cancel',
            mcWidth     : '480px',
            mcMaskClosable: true,
            mcOnOk      : () => console.log('Delete'),
            mcOnCancel  : () => console.log('Cancel')
        });
    }
}
