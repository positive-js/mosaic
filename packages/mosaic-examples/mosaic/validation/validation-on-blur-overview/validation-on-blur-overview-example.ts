import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title Validation
 */
@Component({
    selector: 'validation-on-blur-overview-example',
    templateUrl: 'validation-on-blur-overview-example.html',
    styleUrls: ['validation-on-blur-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationOnBlurOverviewExample {
    ipAddress: FormControl;

    constructor() {
        this.ipAddress = new FormControl('', [Validators.pattern(IP_PATTERN)]);
    }
}
