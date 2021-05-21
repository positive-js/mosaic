import { Component  } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';


/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-validation-letters-symbols',
    templateUrl: 'timepicker-validation-symbols-example.html',
    styleUrls: ['timepicker-validation-symbols-example.css']
})
export class TimepickerValidationSymbolsExample {
    time: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.time = this.adapter.today().startOf('hour');
    }
}
