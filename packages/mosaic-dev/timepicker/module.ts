import {
    Component,
    NgModule,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';

import { McButtonModule } from '../../mosaic/button';
import { McIconModule } from '../../mosaic/icon';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    styleUrls: ['../main.scss', 'styles.scss'],
    templateUrl: 'template.html',
    encapsulation: ViewEncapsulation.None
})
export class TimepickerDemoComponent {
    minDate = moment('2020-04-22 12:00:00');
    maxDate = moment('2000-10-01 15:00:00');
    timeValue = new FormControl(moment('2000-10-01 12:00:00'), Validators.min(this.minDate));
    isDisabled: boolean = false;

    timeFormat = 'HH:mm';
    testForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.testForm = this.fb.group({
            time: [moment('2000-10-01 12:00:00')]
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }
}

@NgModule({
    declarations: [
        TimepickerDemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McTimepickerModule,
        McFormFieldModule,
        McButtonModule,
        McIconModule,
        McMomentDateModule,
        ReactiveFormsModule
    ],
    bootstrap: [
        TimepickerDemoComponent
    ]
})
export class DemoModule {}

