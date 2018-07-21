import { Component, NgModule, TemplateRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';
import { McIconModule } from '../../lib/icon';
import { McModalModule, McModalRef, McModalService } from '../../lib/modal';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss']
})
export class ButtonDemoComponent {
    isVisible = false;
    tplModal: McModalRef;

    constructor(private modalService: McModalService) {
    }

    showConfirm(): void {
        this.modalService.confirm({
            mcTitle  : '<i>Do you Want to delete these items?</i>',
            mcOkText: 'okey',
            mcCancelText: 'nooo!',
            mcContent: '<b>Some descriptions</b>',
            mcOnOk   : () => console.log('OK')
        });
    }

    showDeleteConfirm(): void {
        this.modalService.confirm({
            mcTitle     : 'Are you sure delete this task?',
            mcContent   : '<b style="color: red;">Some descriptions</b>',
            mcOkText    : 'Yes',
            mcOkType    : 'danger',
            mcOnOk      : () => console.log('OK'),
            mcCancelText: 'No',
            mcOnCancel  : () => console.log('Cancel')
        });
    }

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>): void {
        this.tplModal = this.modalService.create({
            mcTitle: tplTitle,
            mcContent: tplContent,
            mcFooter: tplFooter,
            mcMaskClosable: false,
            mcClosable: false,
            mcOnOk: () => console.log('Click ok')
        });
    }

    destroyTplModal(): void {
        this.tplModal.destroy();
    }

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        console.log('Button ok clicked!');
        this.isVisible = false;
    }

    handleCancel(): void {
        console.log('Button cancel clicked!');
        this.isVisible = false;
    }
}


@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McIconModule,
        McModalModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    .catch((error) => console.error(error));

