import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title Validation
 */
@Component({
    selector: 'validation-on-type-overview-example',
    templateUrl: 'validation-on-type-overview-example.html',
    styleUrls: ['validation-on-type-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationOnTypeOverviewExample {
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
