import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


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
    return (control: AbstractControl): ValidationErrors | null => regex.test(control.value) ? { pattern: true } : null;
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
    compositeFormWithOnTypeChecking: FormGroup;
    compositeFormWithOnBlurChecking: FormGroup;

    @ViewChild('startTooltip', { static: false }) startTooltip: any;
    @ViewChild('endTooltip', { static: false }) endTooltip: any;

    constructor() {
        this.compositeFormWithOnTypeChecking = new FormGroup({
            start: new FormControl('', [fieldValidator(IP_PATTERN)]),
            end: new FormControl('', [fieldValidator(IP_PATTERN)])
        }, groupValidator());

        this.compositeFormWithOnBlurChecking = new FormGroup({
            start: new FormControl('', [Validators.pattern(IP_PATTERN)]),
            end: new FormControl('', [Validators.pattern(IP_PATTERN)])
        }, groupValidator());
    }

    onInputStart(event) {
        const regex = /^[\d\.]+$/g;

        if (!regex.test(event.target.value)) {
            event.target.value = event.target.value.replace(/[^\d\.]+/g, '');

            if (!this.startTooltip.isTooltipOpen) {
                this.startTooltip.show();

                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => this.startTooltip.hide(), 3000);
            }
        }
    }

    onInputEnd(event) {
        const regex = /^[\d\.]+$/g;

        if (!regex.test(event.target.value)) {
            event.target.value = event.target.value.replace(/[^\d\.]+/g, '');

            if (!this.endTooltip.isTooltipOpen) {
                this.endTooltip.show();

                // tslint:disable-next-line:no-magic-numbers
                setTimeout(() => this.endTooltip.hide(), 3000);
            }
        }
    }
}
