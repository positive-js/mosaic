import { Component } from '@angular/core';
import * as momentImported from 'moment';


const moment = momentImported;
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
