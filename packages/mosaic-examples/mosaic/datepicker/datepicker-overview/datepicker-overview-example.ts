import { Component } from '@angular/core';
import { DateTime } from 'luxon';


/**
 * @title Datepicker
 */
@Component({
    selector: 'datepicker-overview-example',
    templateUrl: 'datepicker-overview-example.html',
    styleUrls: ['datepicker-overview-example.css']
})
export class DatepickerOverviewExample {
    date: DateTime;
}
