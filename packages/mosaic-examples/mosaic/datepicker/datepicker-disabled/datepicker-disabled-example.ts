import { Component } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';


/**
 * @title Disabled datepicker
 */
@Component({
    selector: 'datepicker-disabled-example',
    templateUrl: 'datepicker-disabled-example.html',
    styleUrls: ['datepicker-disabled-example.css']
})
export class DatepickerDisabledExample {
    sunday = 6;

    date: DateTime;
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.date = this.adapter.today();
        this.minDate = this.adapter.today().minus({ year: 1 });
        this.maxDate = this.adapter.today().plus({ year: 1 });
    }

    myFilter(date: DateTime): boolean {
        return date.day !== 0 && date.day !== this.sunday;
    }
}
