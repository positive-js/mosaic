// tslint:disable:no-console
import { Component, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { McModalService, ModalSize } from '@ptsecurity/mosaic/modal';


/**
 * @title Multiple Modal
 */
@Component({
    selector: 'modal-multiple-example',
    templateUrl: 'modal-multiple-example.html',
    styleUrls: ['modal-multiple-example.css']
})
export class ModalMultipleExample {
    @ViewChild(McButton) modalButton: McButton;

    // use modalService to prevent multiple overlaid masks
    constructor(private modalService: McModalService) {}

    showConfirmModal() {
        const modalRef = this.modalService.confirm({
            mcSize: ModalSize.Normal,
            mcBodyStyle: {height: '120px'},
            mcMaskClosable: true,
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.modalButton.focusViaKeyboard());
        this.showSuccessModal();
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
}
