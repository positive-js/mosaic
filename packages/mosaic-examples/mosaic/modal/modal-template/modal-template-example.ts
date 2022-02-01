// tslint:disable:no-console
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { ThemePalette } from '@ptsecurity/mosaic/core';
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
    themePalette = ThemePalette;

    @ViewChild('modalButton') modalButton: McButton;

    constructor(private modalService: McModalService) {}

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
        this.tplModal = this.modalService.create({
            mcTitle: tplTitle,
            mcContent: tplContent,
            mcFooter: tplFooter,
            mcOnOk: () => console.log('Click ok')
        });

        this.tplModal.afterClose.subscribe(() => this.modalButton.focusViaKeyboard());
    }

    destroyTplModal() {
        this.tplModal.triggerOk();
        this.tplModal.destroy();
    }
}
