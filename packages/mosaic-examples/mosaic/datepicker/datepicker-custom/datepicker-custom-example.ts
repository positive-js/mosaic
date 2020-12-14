import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE, McDateFormats } from '@ptsecurity/cdk/datetime';
import {
    MC_MOMENT_DATE_ADAPTER_OPTIONS,
    MC_MOMENT_DATE_FORMATS,
    MomentDateAdapter
} from '@ptsecurity/mosaic-moment-adapter/adapter';
import * as momentImported from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';


// @dynamic
export function mcDateAdapterFactory(locale: string) {
    const dateAdapter = new MomentDateAdapter(locale);
    dateAdapter.updateLocaleData({ firstDayOfWeek: 1 });

    return dateAdapter;
}

// @dynamic
export function mcDateFormatsFactory() {
    const dateFormats = { ...MC_MOMENT_DATE_FORMATS } as unknown as McDateFormats;

    dateFormats.display.dateInput = 'DD.MM.YYYY';

    return dateFormats;
}


// tslint:disable-next-line
const moment = _rollupMoment || momentImported;
/**
 * @title Custom localeData and format datepicker
 */
@Component({
    selector: 'datepicker-custom-example',
    templateUrl: 'datepicker-custom-example.html',
    styleUrls: ['datepicker-custom-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'en' },
        { provide: MC_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { findDateFormat: true } },
        {
            provide: MC_DATE_FORMATS,
            useFactory: mcDateFormatsFactory
        },
        {
            provide: DateAdapter,
            useFactory: mcDateAdapterFactory,
            deps: [MC_DATE_LOCALE]
        }
    ]
})
export class DatepickerCustomExample {
    sunday = 6;
    date = moment();
    minDate = moment().subtract(1, 'year');
    maxDate = moment().add(1, 'years');
}
