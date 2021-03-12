import { Component } from '@angular/core';
import * as momentImported from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';


// tslint:disable-next-line
const moment = _rollupMoment || momentImported;
/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-variations-example',
    templateUrl: 'timepicker-variations-example.html',
    styleUrls: ['timepicker-variations-example.css']
})
export class TimepickerVariationsExample {
    moment = moment;

    value = this.moment();

    timeFormat = 'HH:mm';
}
