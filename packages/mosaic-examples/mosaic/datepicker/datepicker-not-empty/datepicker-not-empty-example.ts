import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateTime } from 'luxon';


/**
 * @title Datepicker
 */
@Component({
    selector: 'datepicker-not-empty-example',
    templateUrl: 'datepicker-not-empty-example.html',
    styleUrls: ['datepicker-not-empty-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        {
            provide: DateAdapter,
            useFactory: (locale: string) => new LuxonDateAdapter(locale),
            deps: [MC_DATE_LOCALE]
        }
    ]
})
export class DatepickerNotEmptyExample {
    date: DateTime;

    constructor(adapter: DateAdapter<DateTime>) {
        this.date = adapter.today();
    }
}
