import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { McTooltip } from '@ptsecurity/mosaic/tooltip';


function groupValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        const start = g.get('start')?.value;
        const end = g.get('end')?.value;

        if (IP_PATTERN.test(start) && IP_PATTERN.test(end)) {
            const parsedStartIp = start.split('.').map((octet) => parseInt(octet, 10));
            const parsedEndIp = end.split('.').map((octet) => parseInt(octet, 10));

            for (let i = 0; i < parsedStartIp.length; i++) {
                if (parsedStartIp[i] > parsedEndIp[i]) { return { range: true }; }
            }
        }

        return null;
    };
}

function fieldValidator(regex: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) { return null; }

        return regex.test(control.value) ? null : { pattern: true };
    };
}

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title validation-composite
 */
@Component({
    selector: 'validation-composite-example',
    templateUrl: 'validation-composite-example.html',
    styleUrls: ['validation-composite-example.css']
})
export class ValidationCompositeExample {
    compositeFormGroup: FormGroup;

    @ViewChild('startTooltip', { static: false }) startTooltip: any;
    @ViewChild('endTooltip', { static: false }) endTooltip: any;

    constructor() {
        this.compositeFormGroup = new FormGroup(
            {
                start: new FormControl('', [fieldValidator(IP_PATTERN)]),
                end: new FormControl('', [fieldValidator(IP_PATTERN)])
            },
            { updateOn: 'blur', validators: [groupValidator()] }
        );
    }

    onInput(event, tooltip: McTooltip, controlName: string) {
        const regex = /^[\d\.]+$/g;

        if (!regex.test(event.target.value)) {
            const newValue = event.target.value.replace(/[^\d\.]+/g, '');
            this.compositeFormGroup.controls[controlName].setValue(newValue);

            if (!tooltip.isOpen) {
                tooltip.show();

                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => tooltip.hide(), 3000);
            }
        }
    }
}
