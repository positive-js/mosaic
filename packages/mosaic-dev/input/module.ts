/* tslint:disable:no-magic-numbers */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';

import { McFormFieldModule, PasswordRules } from '../../mosaic/form-field';
import { McIconModule } from '../../mosaic/icon';
import { McInputModule } from '../../mosaic/input/';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InputDemoComponent {
    passwordRules = PasswordRules;
    password = '456';

    value: string = '';
    numberValue: number | null = null;
    min = -5;
    customRegex = /\D/;
}


@NgModule({
    declarations: [InputDemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,

        McFormFieldModule,
        McButtonModule,
        McInputModule,
        McToolTipModule,
        McIconModule
    ],
    bootstrap: [InputDemoComponent]
})
export class DemoModule {}
