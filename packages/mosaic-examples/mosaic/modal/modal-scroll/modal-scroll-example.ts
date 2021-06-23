import { Component, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { McModalService, ModalSize } from '@ptsecurity/mosaic/modal';


@Component({
    selector: 'mc-long-component',
    template: `
        <p *ngFor="let item of longText">{{ item }}</p>
    `
})
export class McLongComponent {
    longText: any = [];

    constructor() {
        // tslint:disable-next-line:no-magic-numbers
        for (let i = 0; i < 50; i++) {
            this.longText.push(`text lint - ${i}`);
        }
    }
}


/**
 * @title Component Modal Scroll
 */
@Component({
    selector: 'modal-scroll-example',
    template: `<button #modalButton mc-button (click)="createLongModal()">Open Modal</button>`,
    styleUrls: ['modal-scroll-example.css']
})
export class ModalScrollExample {
    @ViewChild('modalButton') modalButton: McButton;

    constructor(private modalService: McModalService) {}

    createLongModal() {
        const modalRef = this.modalService.create({
            mcSize      : ModalSize.Small,
            mcTitle     : 'Modal Title',
            mcContent   : McLongComponent,
            mcOkText    : 'Yes',
            mcCancelText: 'No'
        });

        modalRef.afterClose.subscribe(() => this.modalButton.focusViaKeyboard());
    }
}
