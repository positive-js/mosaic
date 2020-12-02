import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';


const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title validation-on-blur
 */
@Component({
    selector: 'validation-on-blur-example',
    templateUrl: 'validation-on-blur-example.html',
    styleUrls: ['validation-on-blur-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationOnBlurExample {
    ipAddress: FormControl;

    constructor() {
        this.ipAddress = new FormControl('', [Validators.pattern(IP_PATTERN)]);
    }
}
