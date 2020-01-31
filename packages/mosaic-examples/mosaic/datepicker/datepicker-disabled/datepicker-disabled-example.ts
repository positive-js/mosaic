import { Component } from '@angular/core';
import * as momentImported from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


// tslint:disable-next-line
const moment = _rollupMoment || momentImported;
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
    date = moment();
    minDate = moment().subtract(1, 'year');
    maxDate = moment().add(1, 'years');

    myFilter(date: Moment): boolean {
        const day = date.day();

        return day !== 0 && day !== this.sunday;
    }
}
