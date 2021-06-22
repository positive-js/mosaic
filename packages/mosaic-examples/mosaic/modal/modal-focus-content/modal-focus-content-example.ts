// tslint:disable:no-console
import { Component, ViewChild } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { McInput } from '@ptsecurity/mosaic/input';
import { McModalRef, McModalService } from '@ptsecurity/mosaic/modal';


/**
 * @title Modal with focused content
 */
@Component({
    selector: 'modal-focus-content-example',
    templateUrl: 'modal-focus-content-example.html',
    styleUrls: ['modal-focus-content-example.css']
})
export class ModalFocusContentExample {
    componentModal: McModalRef;

    @ViewChild('modalButton') modalButton: McButton;

    constructor(private modalService: McModalService) {}

    openModal() {
        this.componentModal = this.modalService.open({
            mcComponent: McModalFocusContentComponent
        });

        this.componentModal.afterOpen.subscribe(() => {
            const { focusedField } = this.componentModal.getContentComponent();

            focusedField.focus();
        });

        this.componentModal.afterClose.subscribe(() => {
            this.modalButton.focusViaKeyboard();
        });
    }
}

@Component({
    selector: 'mc-modal-focus-content-component',
    template: `
        <mc-modal-title>Modal Title</mc-modal-title>

        <mc-modal-body>
            <form class="mc-form-horizontal margin" novalidate>
                <div class="mc-form__row">
                    <label class="mc-form__label">Подпись поля</label>
                    <mc-form-field class="mc-form__control flex-80">
                        <input name="input" #focusedField mcInput>

                        <mc-hint>Подсказка под полем</mc-hint>
                    </mc-form-field>
                </div>

                <div class="mc-form__row">
                    <label class="mc-form__label">Подпись поля</label>
                    <mc-form-field class="mc-form__control flex-50">
                        <input name="input" mcInput>

                        <mc-hint>Подсказка под полем</mc-hint>
                    </mc-form-field>
                    <mc-form-field class="mc-form__control flex-30">
                        <input name="input" mcInput>

                        <mc-hint>Подсказка под полем</mc-hint>
                    </mc-form-field>
                </div>
            </form>
        </mc-modal-body>

        <div mc-modal-footer>
            <button mc-button [color]="'primary'" (click)="destroyModal('save')">Save</button>
            <button mc-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
  `
})
export class McModalFocusContentComponent {
    @ViewChild('focusedField', { read: McInput }) focusedField: McInput;

    constructor(private modal: McModalRef) { }

    destroyModal(action: 'save' | 'close') {
        this.modal.destroy(action);
    }
}
