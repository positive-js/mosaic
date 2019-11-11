import { Component } from '@angular/core';
import * as momentImported from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';


// tslint:disable-next-line
const moment = _rollupMoment || momentImported;
/**
 * @title Badges
 */
@Component({
    selector: 'timepicker-overview-example',
    templateUrl: 'timepicker-overview-example.html',
    styleUrls: ['timepicker-overview-example.css']
})
export class TimepickerOverviewExample {
    isDisabled = false;
    isIconVisible = true;
    moment = moment;

    value = this.moment();

    timeFormat = 'HH:mm';
}
