import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE, McDateFormats } from '@ptsecurity/cdk/datetime';
import {
    LuxonDateAdapter,
    MC_LUXON_DATE_FORMATS
} from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateTime } from 'luxon';


// @dynamic
export function mcDateAdapterFactory(locale: string) {
    const dateAdapter = new LuxonDateAdapter(locale);
    dateAdapter.updateLocaleData({ firstDayOfWeek: 1 });

    return dateAdapter;
}

// @dynamic
export function mcDateFormatsFactory() {
    const dateFormats = { ...MC_LUXON_DATE_FORMATS } as unknown as McDateFormats;

    dateFormats.dateInput = 'dd.MM.yyyy';

    return dateFormats;
}


/**
 * @title Custom localeData and format datepicker
 */
@Component({
    selector: 'datepicker-custom-example',
    templateUrl: 'datepicker-custom-example.html',
    styleUrls: ['datepicker-custom-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'en' },
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
    date: DateTime;
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.date = this.adapter.today();
        this.minDate = this.adapter.today().minus({ year: 1 });
        this.maxDate = this.adapter.today().plus({ year: 1 });
    }
}
