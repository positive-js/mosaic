import { Component } from '@angular/core';
import { PasswordRules } from '@ptsecurity/mosaic/form-field';


/**
 * @title Password Input
 */
@Component({
    selector: 'input-password-overview-example',
    templateUrl: 'input-password-overview-example.html',
    styleUrls: ['input-password-overview-example.css']
})
export class InputPasswordOverviewExample {
    passwordRules = PasswordRules;

    value = '';
}
