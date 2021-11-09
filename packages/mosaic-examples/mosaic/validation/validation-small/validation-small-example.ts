import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ThemePalette } from '@ptsecurity/mosaic/core';


function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}


/**
 * @title validation-small
 */
@Component({
    selector: 'validation-small-example',
    templateUrl: 'validation-small-example.html',
    styleUrls: ['validation-small-example.css']
})
export class ValidationSmallExample {
    themePalette = ThemePalette;

    smallForm: FormGroup;

    constructor() {
        this.smallForm = new FormGroup(
            {
                firstName: new FormControl('', Validators.required),
                lastName: new FormControl('', Validators.required)
            },
            emptyFormValidator()
        );
    }
}
