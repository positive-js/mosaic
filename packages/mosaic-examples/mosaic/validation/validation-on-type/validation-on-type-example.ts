import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


/**
 * @title validation-on-type
 */
@Component({
    selector: 'validation-on-type-example',
    templateUrl: 'validation-on-type-example.html',
    styleUrls: ['validation-on-type-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationOnTypeExample {
    checkOnFlyForm: FormGroup;

    @ViewChild('tooltip', { static: false }) tooltip: any;

    constructor() {
        this.checkOnFlyForm = new FormGroup({
            folderName: new FormControl('')
        });
    }

    onInput(event) {
        const regex = /^\d+$/g;

        if (!regex.test(event.target.value)) {
            event.target.value = event.target.value.replace(/\D+/g, '');

            if (!this.tooltip.isTooltipOpen) {
                this.tooltip.show();

                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => this.tooltip.hide(), 3000);
            }
        }
    }
}
