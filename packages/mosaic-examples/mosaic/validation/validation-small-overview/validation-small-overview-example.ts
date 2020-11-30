import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}


/**
 * @title Validation
 */
@Component({
    selector: 'validation-small-overview-example',
    templateUrl: 'validation-small-overview-example.html',
    styleUrls: ['validation-small-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationSmallOverviewExample {
    smallForm: FormGroup;

    constructor() {
        this.smallForm = new FormGroup({
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required)
        }, emptyFormValidator());
    }
}
