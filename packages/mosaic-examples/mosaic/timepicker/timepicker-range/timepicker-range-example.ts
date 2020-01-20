import { Component } from '@angular/core';
import * as momentImported from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';


// tslint:disable-next-line
const moment = _rollupMoment || momentImported;
/**
 * @title Timepicker range
 */
@Component({
    selector: 'timepicker-range-example',
    templateUrl: 'timepicker-range-example.html',
    styleUrls: ['timepicker-range-example.css']
})
export class TimepickerRangeExample {
    moment = moment;
    format = 'HH:MM';

    startTime = this.moment().startOf('day');
    endTime = this.moment();
}
