import { Component } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';


/**
 * @title Datepicker
 */
@Component({
    selector: 'datepicker-not-empty-example',
    templateUrl: 'datepicker-not-empty-example.html',
    styleUrls: ['datepicker-not-empty-example.css']
})
export class DatepickerNotEmptyExample {
    date: DateTime;

    constructor(adapter: DateAdapter<DateTime>) {
        this.date = adapter.today();
    }
}
