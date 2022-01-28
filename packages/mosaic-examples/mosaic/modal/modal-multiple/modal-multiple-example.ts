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

        modalRef.afterClose.subscribe(() => this.modalButton.focusViaKeyboard());
        this.showSuccessModal();
    }

    showSuccessModal() {
        this.modalService.success({
            mcSize: ModalSize.Small,
            mcStyle: { position: 'relative', top: `200px` },
            mcMaskClosable: true,
            //  Hide second mask
            mcMaskStyle: {opacity: 0},
            mcContent   : 'All changes are saved!',
            mcOkText    : 'ОК',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });
    }
}
