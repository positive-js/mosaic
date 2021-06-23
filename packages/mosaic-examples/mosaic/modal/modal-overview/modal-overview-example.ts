// tslint:disable:no-console
import { Component, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
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
    @ViewChild('confirm') confirmModal: McButton;
    @ViewChild('success') successModal: McButton;
    @ViewChild('delete') deleteModal: McButton;

    constructor(private modalService: McModalService) {}

    showConfirmModal() {
        const modalRef = this.modalService.confirm({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.confirmModal.focusViaKeyboard());
    }

    showSuccessModal() {
        const modalRef = this.modalService.success({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent   : 'All changes are saved!',
            mcOkText    : 'ОК',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.successModal.focusViaKeyboard());
    }

    showDeleteModal() {
        const modalRef = this.modalService.delete({
            mcContent   : 'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?',
            mcOkText    : 'Delete',
            mcCancelText: 'Cancel',
            mcWidth     : '480px',
            mcMaskClosable: true,
            mcOnOk      : () => console.log('Delete'),
            mcOnCancel  : () => console.log('Cancel')
        });

        modalRef.afterClose.subscribe(() => this.deleteModal.focusViaKeyboard());
    }
}
