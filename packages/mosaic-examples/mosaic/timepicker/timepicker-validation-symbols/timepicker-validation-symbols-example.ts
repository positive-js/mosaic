import { Component  } from '@angular/core';
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
    selector: 'timepicker-validation-letters-symbols',
    templateUrl: 'timepicker-validation-symbols-example.html',
    styleUrls: ['timepicker-validation-symbols-example.css']
})
export class TimepickerValidationSymbolsExample {
    moment = moment;
    time = this.moment().startOf('hour');
}
