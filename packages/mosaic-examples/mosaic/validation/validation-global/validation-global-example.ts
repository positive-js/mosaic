import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


/**
 * @title validation-global
 */
@Component({
    selector: 'validation-global-example',
    templateUrl: 'validation-global-example.html',
    styleUrls: ['validation-global-example.css']
})
export class ValidationGlobalExample {
    globalErrorForm: FormGroup;
    showServerErrors: boolean = false;
    inProgress: boolean = false;

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

        setTimeout(() => {
            this.showServerErrors = true;
            this.inProgress = false;
            // tslint:disable-next-line:no-magic-numbers
        }, 1000);
    }
}
