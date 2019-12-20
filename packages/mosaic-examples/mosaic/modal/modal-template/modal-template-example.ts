// tslint:disable:no-console
import { Component, TemplateRef } from '@angular/core';
import { McModalRef, McModalService } from '@ptsecurity/mosaic/modal';


/**
 * @title Template Modal
 */
@Component({
    selector: 'modal-template-example',
    templateUrl: 'modal-template-example.html',
    styleUrls: ['modal-template-example.css']
})
export class ModalTemplateExample {
    tplModal: McModalRef;

    constructor(private modalService: McModalService) {}

    createTplModal(tplTitle: TemplateRef<{}>, tplContent?: TemplateRef<{}>, tplFooter?: TemplateRef<{}>) {
        this.tplModal = this.modalService.create({
            mcTitle       : tplTitle,
            mcContent     : tplContent,
            mcFooter      : tplFooter,
            mcClosable    : true,
            mcOnOk        : () => console.log('Click ok')
        });
    }

    destroyTplModal() {
        this.tplModal.triggerOk();
        this.tplModal.destroy();
    }
}
