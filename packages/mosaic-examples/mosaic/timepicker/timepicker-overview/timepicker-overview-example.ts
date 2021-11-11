import { Component } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { TimeFormats } from '@ptsecurity/mosaic/timepicker';
import { DateTime } from 'luxon';


/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-overview-example',
    templateUrl: 'timepicker-overview-example.html',
    styleUrls: ['timepicker-overview-example.css']
})
export class TimepickerOverviewExample {
    isDisabled = false;
    isIconVisible = true;

    value: DateTime;

    timeFormat = TimeFormats.HHmm;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.value = this.adapter.today();
    }
}
