/* tslint:disable:no-magic-numbers */
import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter } from '@ptsecurity/mosaic/core';
import { DateTime } from 'luxon';


/**
 * @title Basic progress absolute-date-formatter
 */
@Component({
    selector: 'absolute-date-formatter-example',
    templateUrl: 'absolute-date-formatter-example.html',
    styleUrls: ['absolute-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MC_DATE_LOCALE] },
        { provide: DateFormatter, deps: [DateAdapter, MC_DATE_LOCALE] }
    ]
})
export class AbsoluteDateFormatterExample {
    formats: any = {
        ru: {
            absolute: {
                long: {
                    date: {},
                    dateTime: {}
                },
                short: {
                    date: {},
                    dateTime: {}
                }
            }
        },
        en: {
            absolute: {
                long: {
                    date: {},
                    dateTime: {}
                },
                short: {
                    date: {},
                    dateTime: {}
                }
            }
        }
    };

    constructor(private formatter: DateFormatter<DateTime>, private adapter: DateAdapter<DateTime>) {
        this.populateAbsoluteLong('ru');
        this.populateAbsoluteLong('en');

        this.populateAbsoluteShort('ru');
        this.populateAbsoluteShort('en');
    }

    private populateAbsoluteShort(locale: string) {
        this.formatter.setLocale(locale);

        const now = this.adapter.today();

        const absoluteShort = this.formats[locale].absolute.short;

        absoluteShort.date.currentYear = this.formatter.absoluteShortDate(now);
        absoluteShort.date.notCurrentYear = this.formatter.absoluteShortDate(now.minus({ years: 1 }));
        absoluteShort.dateTime.currentYear = this.formatter.absoluteShortDateTime(now);
        absoluteShort.dateTime.notCurrentYear = this.formatter.absoluteShortDateTime(now.minus({ years: 1 }));
        absoluteShort.dateTime.milliseconds = this.formatter.absoluteShortDateTime(now, { milliseconds: true });
    }

    private populateAbsoluteLong(locale: string) {
        this.formatter.setLocale(locale);

        const now = this.adapter.today();

        const absoluteLong = this.formats[locale].absolute.long;

        absoluteLong.date.currentYear = this.formatter.absoluteLongDate(now);
        absoluteLong.date.notCurrentYear = this.formatter.absoluteLongDate(now.minus({ years: 1 }));
        absoluteLong.dateTime.currentYear = this.formatter.absoluteLongDateTime(now);
        absoluteLong.dateTime.notCurrentYear = this.formatter.absoluteLongDateTime(now.minus({ years: 1 }));
        absoluteLong.dateTime.milliseconds = this.formatter.absoluteLongDateTime(now, { milliseconds: true });
    }
}
