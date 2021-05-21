import { Component } from '@angular/core';
import { DateTime } from 'luxon';


/**
 * @title Datepicker starts with year
 */

@Component({
    selector: 'datepicker-year-example',
    templateUrl: 'datepicker-year-example.html',
    styleUrls: ['datepicker-year-example.css']
})
export class DatepickerYearExample {
    date: DateTime;
}
