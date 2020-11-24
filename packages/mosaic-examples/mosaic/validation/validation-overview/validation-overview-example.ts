import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { noop } from 'rxjs';


function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}

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

@Component({
    selector: 'validation-overview-example',
    templateUrl: 'validation-overview-example.html',
    styleUrls: ['validation-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationOverviewExample {
    feedbackForm: FormGroup;
    feedbackFormWithHints: FormGroup;
    globalErrorForm: FormGroup;
    smallForm: FormGroup;
    checkOnFlyForm: FormGroup;
    compositeForm: FormGroup;

    @ViewChild('tooltip', { static: false }) tooltip: any;

    showServerErrors: boolean = false;
    inProgress: boolean = false;

    ipAddress: FormControl;

    constructor() {
        this.feedbackFormWithHints = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });

        this.feedbackForm = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });

        this.globalErrorForm = new FormGroup({
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            thirdName: new FormControl('')
        });

        this.smallForm = new FormGroup({
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required)
        }, emptyFormValidator());

        this.checkOnFlyForm = new FormGroup({
            folderName: new FormControl('')
        });

        this.compositeForm = new FormGroup({
            start: new FormControl('', [Validators.pattern(IP_PATTERN)]),
            end: new FormControl('', [Validators.pattern(IP_PATTERN)])
        }, compositeFormValidator());

        this.ipAddress = new FormControl('', [Validators.pattern(IP_PATTERN)]);
    }

    onSubmitFeedbackForm(form: FormGroup) {
        noop();
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
