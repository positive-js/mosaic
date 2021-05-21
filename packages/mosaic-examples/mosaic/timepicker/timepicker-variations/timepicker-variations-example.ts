import { Component } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';


/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-variations-example',
    templateUrl: 'timepicker-variations-example.html',
    styleUrls: ['timepicker-variations-example.css']
})
export class TimepickerVariationsExample {
    value: DateTime;

    timeFormat = 'HH:mm';

    constructor(private adapter: DateAdapter<DateTime>) {
        this.value = this.adapter.today();
    }
}
