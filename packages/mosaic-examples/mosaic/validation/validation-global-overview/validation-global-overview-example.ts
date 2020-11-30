import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


/**
 * @title Validation
 */
@Component({
    selector: 'validation-global-overview-example',
    templateUrl: 'validation-global-overview-example.html',
    styleUrls: ['validation-global-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationGlobalOverviewExample {
    globalErrorForm: FormGroup;
    showServerErrors: boolean = false;
    inProgress: boolean = false;

    ipAddress: FormControl;

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
