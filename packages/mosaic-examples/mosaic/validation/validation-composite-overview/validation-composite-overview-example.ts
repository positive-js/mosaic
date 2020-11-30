import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


function compositeFormValidator(): ValidatorFn {
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

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title Validation
 */
@Component({
    selector: 'validation-composite-overview-example',
    templateUrl: 'validation-composite-overview-example.html',
    styleUrls: ['validation-composite-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationCompositeOverviewExample {
    compositeForm: FormGroup;

    constructor() {
        this.compositeForm = new FormGroup({
            start: new FormControl('', [Validators.pattern(IP_PATTERN)]),
            end: new FormControl('', [Validators.pattern(IP_PATTERN)])
        }, compositeFormValidator());
    }
}
