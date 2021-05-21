import { Component } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';


/**
 * @title Timepicker range
 */
@Component({
    selector: 'timepicker-range-example',
    templateUrl: 'timepicker-range-example.html',
    styleUrls: ['timepicker-range-example.css']
})
export class TimepickerRangeExample {
    format = 'HH:mm:ss';

    startTime: DateTime;
    endTime: DateTime;
    time: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.startTime = this.adapter.today().startOf('day');
        this.endTime = this.adapter.today();
        this.time = this.adapter.today().startOf('hour');
    }

    getStartTime() {
        return this.startTime ? this.startTime.toFormat(this.format) : '';
    }

    getEndTime() {
        return this.endTime ? this.endTime.toFormat(this.format) : '';
    }
}
