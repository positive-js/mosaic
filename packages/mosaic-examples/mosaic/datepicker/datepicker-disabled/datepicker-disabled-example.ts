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
    date = moment([2019, 0, 24]);
    minDate = moment([2015, 0, 1]);
    maxDate = moment([2020, 0, 1]);

    myFilter(date: Moment): boolean {
        const day = date.day();

        return day !== 0 && day !== 6;
    }
}
