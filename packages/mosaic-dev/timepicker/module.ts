/* tslint:disable:no-magic-numbers */
import {
    Component,
    NgModule,
    ViewEncapsulation
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidatorFn
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { DateTime } from 'luxon';

import { McButtonModule } from '../../mosaic/button';
import { McIconModule } from '../../mosaic/icon';


export function customValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => ({ customValidator: { value: control.value } });
}

@Component({
    selector: 'app',
    styleUrls: ['../main.scss', 'styles.scss'],
    templateUrl: 'template.html',
    encapsulation: ViewEncapsulation.None
})
export class TimepickerDemoComponent {
    placeholder: string = 'placeholder';
    minDate: DateTime;
    maxDate: DateTime;

    reactiveFormControlValue: FormControl;
    formControlValue: FormControl;

    ngModelValue: any;

    isDisabled: boolean = false;

    timeFormat = 'HH:mm';
    testForm: FormGroup;

    constructor(private fb: FormBuilder, private adapter: DateAdapter<DateTime>) {
        this.minDate = this.adapter.createDateTime(2020, 5, 6, 12, 0, 0, 0);
        this.maxDate = this.adapter.createDateTime(2020, 5, 6, 12, 15, 0, 0);
        this.reactiveFormControlValue = new FormControl(this.adapter.createDateTime(2000, 10, 1, 12, 0, 0, 0));
        this.formControlValue = new FormControl(this.adapter.createDateTime(2020, 5, 6, 12, 0, 0, 0));
        this.ngModelValue = this.adapter.createDateTime(2020, 5, 6, 13, 0, 0, 0);

        this.testForm = this.fb.group({
            time: [this.adapter.createDateTime(2000, 10, 1, 12, 0, 0, 0)]
        });

        this.reactiveFormControlValue.valueChanges.subscribe((value) => {
            console.log('this.reactiveFormControlValue:', value); // tslint:disable-line:no-console
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }

    ngModelChange(value: any) {
        console.log('ngModelChange: ', value); // tslint:disable-line:no-console
    }
}

@NgModule({
    declarations: [TimepickerDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        McTimepickerModule,
        McToolTipModule,
        McFormFieldModule,
        McButtonModule,
        McIconModule,
        McLuxonDateModule,
        ReactiveFormsModule
    ],
    bootstrap: [TimepickerDemoComponent]
})
export class DemoModule {}

