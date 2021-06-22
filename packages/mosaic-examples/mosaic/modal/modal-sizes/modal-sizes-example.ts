// tslint:disable:no-console
import { Component, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { McModalService, ModalSize } from '@ptsecurity/mosaic/modal';


/**
 * @title Sizes Modal
 */
@Component({
    selector: 'modal-sizes-example',
    templateUrl: 'modal-sizes-example.html',
    styleUrls: ['modal-sizes-example.css']
})
export class ModalSizesExample {
    @ViewChild('small') smallButton: McButton;
    @ViewChild('default') defaultButton: McButton;
    @ViewChild('large') largeButton: McButton;
    @ViewChild('custom') customButton: McButton;

    constructor(private modalService: McModalService) {}

    showSmallModal() {
        const modalRef = this.modalService.confirm({
            mcSize: ModalSize.Small,
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.smallButton.focusViaKeyboard());
    }

    showDefaultModal() {
        const modalRef = this.modalService.confirm({
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.defaultButton.focusViaKeyboard());
    }

    showLargeModal() {
        const modalRef = this.modalService.confirm({
            mcSize: ModalSize.Large,
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('Delete'),
            mcOnCancel  : () => console.log('Cancel')
        });

        modalRef.afterClose.subscribe(() => this.largeButton.focusViaKeyboard());
    }

    showCustomModal() {
        const modalRef = this.modalService.confirm({
            mcWidth     : '600px',
            mcContent   : 'Save changes?',
            mcOkText    : 'Save',
            mcCancelText: 'Cancel',
            mcOnOk      : () => console.log('Delete'),
            mcOnCancel  : () => console.log('Cancel')
        });

        modalRef.afterClose.subscribe(() => this.customButton.focusViaKeyboard());
    }
}
