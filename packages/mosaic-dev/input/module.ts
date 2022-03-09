/* tslint:disable:no-magic-numbers */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { McFormFieldModule, PasswordRules } from '../../mosaic/form-field';
import { McIconModule } from '../../mosaic/icon';
import { McInputModule } from '../../mosaic/input/';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InputDemoComponent {
    passwordRules = PasswordRules;
    password = new FormControl('', Validators.required);

    value: string = '';
    numberValue: number | null = null;
    min = -5;
}


@NgModule({
    declarations: [InputDemoComponent],
    imports: [
        BrowserModule,
        McButtonModule,
        McInputModule,
        McFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        McIconModule
    ],
    bootstrap: [InputDemoComponent]
})
export class DemoModule {}
