// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component } from '@angular/core';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'datepicker-demo',
    templateUrl: 'datepicker-demo.html',
    styleUrls: ['datepicker-demo.css']
})
export class DatepickerDemo {
    date = moment([2019, 0, 24]);
    minDate = moment([2015, 0, 1]);
    maxDate = moment([2020, 0, 1]);

    myFilter(date: Moment): boolean {
        const day = date.day();

        return day !== 0 && day !== 6;
    }
}
