import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title validation-global
 */
@Component({
    selector: 'validation-global-one-required-example',
    templateUrl: 'validation-global-one-required-example.html',
    styleUrls: ['validation-global-one-required-example.css']
})
export class ValidationGlobalOneRequiredExample {
    themePalette = ThemePalette;

    globalErrorForm: FormGroup;
    showServerErrors = false;

    inProgress = false;
    disabled = false;
    showError = false;

    constructor() {
        this.globalErrorForm = new FormGroup({
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            thirdName: new FormControl('')
        });
    }

    submitGlobalErrorForm() {
        this.showServerErrors = false;
        this.inProgress = true;

        setTimeout(
            () => {
                this.showServerErrors = true;
                this.inProgress = false;
            },
            // tslint:disable-next-line:no-magic-numbers
            1000
        );
    }

    checkForm() {
        this.inProgress = true;

        setTimeout(
            () => {
                this.inProgress = false;
                this.showError = true;
                this.disabled = true;
            },
            // tslint:disable-next-line:no-magic-numbers
            2000
        );
    }
}
